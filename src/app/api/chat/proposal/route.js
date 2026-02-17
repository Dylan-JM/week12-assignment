import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";
import Ably from "ably";

// Proposal limits per subscription tier (proposals per calendar month)
const PROPOSAL_LIMITS = { free: 5, advanced: 25, pro: null };

export const POST = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

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

  const jobResult = await db.query(
    `SELECT j.id, j.client_id, c.clerk_id AS client_clerk_id
     FROM fm_jobs j
     JOIN fm_clients c ON c.id = j.client_id
     WHERE j.id = $1`,
    [jobId],
  );
  const job = jobResult.rows[0];
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  const freelancerResult = await db.query(
    `SELECT id, COALESCE(subscription, 'free') AS subscription
     FROM fm_freelancers WHERE clerk_id = $1`,
    [userId],
  );
  const freelancer = freelancerResult.rows[0];
  const freelancerId = freelancer?.id;
  if (!freelancerId)
    return Response.json(
      { error: "Freelancer profile required" },
      { status: 403 },
    );

  const tier = (freelancer.subscription || "free").toLowerCase();
  const limit = PROPOSAL_LIMITS[tier] ?? PROPOSAL_LIMITS.free;

  if (limit != null) {
    const countResult = await db.query(
      `SELECT COUNT(*)::int AS n FROM (
         SELECT content FROM fm_messages
         WHERE sender_id = $1 AND content ~ '^\\s*\\{'
           AND created_at >= date_trunc('month', current_date)
       ) sub
       WHERE sub.content::jsonb->>'type' = 'proposal'`,
      [userId],
    );
    const used = countResult.rows[0]?.n ?? 0;
    if (used >= limit) {
      return Response.json(
        {
          error: `Proposal limit reached (${used}/${limit} this month). Upgrade your plan to send more.`,
          limit,
          used,
        },
        { status: 403 },
      );
    }
  }

  let conv = await db.query(
    "SELECT id FROM fm_conversations WHERE client_id = $1 AND freelancer_id = $2",
    [job.client_id, freelancerId],
  );

  if (!conv.rows[0]) {
    const insert = await db.query(
      "INSERT INTO fm_conversations (client_id, freelancer_id) VALUES ($1, $2) RETURNING id",
      [job.client_id, freelancerId],
    );
    conv = insert;
  }

  const conversationId = conv.rows[0].id;
  const proposalContent = JSON.stringify({
    type: "proposal",
    jobId,
    text: String(message),
  });
  const insertMsg = await db.query(
    "INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id",
    [conversationId, userId, proposalContent],
  );
  const messageId = insertMsg.rows[0].id;

  let avatarUrl = null;
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const user = await clerk.users.getUser(userId);
    avatarUrl = user?.imageUrl ?? null;
  } catch {
    // use fallback in UI
  }

  const channelSlug = "dm-" + [job.client_clerk_id, userId].sort().join("-");
  const channelName = "chat:" + channelSlug;
  const apiKey =
    process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      const rest = new Ably.Rest(apiKey);
      const channel = rest.channels.get(channelName);
      await channel.publish("ADD", {
        id: messageId,
        text: String(message),
        proposalJobId: jobId,
        senderId: userId,
        avatarUrl,
      });
    } catch (err) {
      console.error("Ably publish failed:", err);
    }
  }

  return Response.json({ ok: true, channelSlug });
};
