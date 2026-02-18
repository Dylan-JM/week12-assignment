import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";
import Ably from "ably";

// Resolve billing period (start/end) from Stripe/Clerk or fallback to current calendar month; also return Clerk user.
async function getPeriodAndUser(userId) {
  const now = new Date();
  const calendarStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const calendarEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();
  let user = null;
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    user = await clerk.users.getUser(userId);
    const stripe = user?.privateMetadata?.stripe?.subscription;
    if (
      stripe?.current_period_start != null &&
      stripe?.current_period_end != null
    ) {
      return {
        start: new Date(stripe.current_period_start * 1000).toISOString(),
        end: new Date(stripe.current_period_end * 1000).toISOString(),
        user,
      };
    }
    if (clerk.billing?.getUserBillingSubscription) {
      const sub = await clerk.billing.getUserBillingSubscription(userId);
      const item = sub?.items?.[0] ?? sub?.subscriptionItems?.[0];
      if (item?.periodStart != null) {
        const start = new Date(item.periodStart);
        const end =
          item.periodEnd != null ? new Date(item.periodEnd) : new Date(start);
        if (item.periodEnd == null) end.setMonth(end.getMonth() + 1);
        return { start: start.toISOString(), end: end.toISOString(), user };
      }
    }
  } catch {
    // ignore
  }
  return { start: calendarStart, end: calendarEnd, user };
}

export const POST = async (request) => {
  const { userId, has } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // is on pro plan = no limit to proposals, advanced plan = 25, else (free) = 5
  const limit = has({ plan: "pro" })
    ? null
    : has({ plan: "advanced" }) || has({ feature: "25_proposals_month" })
      ? 25
      : 5;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { jobId, message } = body;
  if (!jobId || message == null) {
    return Response.json(
      { error: "jobId and message required" },
      { status: 400 },
    );
  }

  const { start, end, user: clerkUser } = await getPeriodAndUser(userId);
  const period = { start, end };

  // Load job (with budget for tier check) and client clerk id for Ably channel.
  const jobRow = await db.query(
    `SELECT j.id, j.client_id, j.budget, c.clerk_id AS client_clerk_id FROM fm_jobs j JOIN fm_clients c ON c.id = j.client_id WHERE j.id = $1`,
    [jobId],
  );
  const job = jobRow.rows[0];
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  const jobTier =
    (Number(job.budget) || 0) < 250
      ? "free"
      : (Number(job.budget) || 0) < 1000
        ? "advanced"
        : "premium";
  const isPro = has({ plan: "pro" });
  const isAdvanced =
    has({ plan: "advanced" }) || has({ feature: "25_proposals_month" });
  const userTier = isPro ? "pro" : isAdvanced ? "advanced" : "free";
  const canApplyByTier =
    jobTier === "free" ||
    (jobTier === "advanced" && (userTier === "advanced" || userTier === "pro")) ||
    (jobTier === "premium" && userTier === "pro");
  if (!canApplyByTier) {
    const required =
      jobTier === "premium"
        ? "Pro"
        : jobTier === "advanced"
          ? "Advanced"
          : "Free";
    return Response.json(
      {
        error: `Upgrade to ${required} to apply for this job.`,
      },
      { status: 403 },
    );
  }

  const freelancerRow = await db.query(
    `SELECT id, proposals_made FROM fm_freelancers WHERE clerk_id = $1`,
    [userId],
  );
  const freelancer = freelancerRow.rows[0];
  if (!freelancer?.id) {
    return Response.json(
      { error: "Freelancer profile required" },
      { status: 403 },
    );
  }

  // Count proposals sent this period; reset proposals_made if period is new (count in DB was 0).
  const countRes = await db.query(
    `SELECT COUNT(*)::int AS n FROM fm_messages WHERE sender_id = $1 AND created_at >= $2::timestamptz AND created_at <= $3::timestamptz AND content LIKE '%"type":"proposal"%'`,
    [userId, period.start, period.end],
  );
  if ((countRes.rows[0]?.n ?? 0) === 0) {
    await db.query(
      `UPDATE fm_freelancers SET proposals_made = 0 WHERE clerk_id = $1`,
      [userId],
    );
    freelancer.proposals_made = 0;
  }

  const used = freelancer.proposals_made ?? 0;
  if (limit != null && used >= limit) {
    return Response.json(
      {
        error: `Proposal limit reached (${used}/${limit} this period). Upgrade your plan to send more.`,
      },
      { status: 403 },
    );
  }

  // Get or create conversation between job client and this freelancer.
  let conv = await db.query(
    `SELECT id FROM fm_conversations WHERE client_id = $1 AND freelancer_id = $2`,
    [job.client_id, freelancer.id],
  );
  if (!conv.rows[0]) {
    conv = await db.query(
      `INSERT INTO fm_conversations (client_id, freelancer_id) VALUES ($1, $2) RETURNING id`,
      [job.client_id, freelancer.id],
    );
  }

  const conversationId = conv.rows[0].id;
  const content = JSON.stringify({
    type: "proposal",
    jobId,
    text: String(message),
  });
  // Insert proposal message.
  const msgRow = await db.query(
    `INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
    [conversationId, userId, content],
  );
  const messageId = msgRow.rows[0].id;

  // Increment proposals_made for this freelancer.
  await db.query(
    `UPDATE fm_freelancers SET proposals_made = COALESCE(proposals_made, 0) + 1 WHERE clerk_id = $1`,
    [userId],
  );

  const channelSlug = "dm-" + [job.client_clerk_id, userId].sort().join("-");
  const apiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      await new Ably.Rest(apiKey).channels
        .get("chat:" + channelSlug)
        .publish("ADD", {
          id: messageId,
          text: String(message),
          proposalJobId: jobId,
          senderId: userId,
          avatarUrl: clerkUser?.imageUrl ?? null,
        });
    } catch {
      // Ably failed
    }
  }

  return Response.json({ ok: true, channelSlug });
};
