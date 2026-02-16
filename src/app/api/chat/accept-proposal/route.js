import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";
import Ably from "ably";

export const POST = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { jobId, freelancerClerkId } = body;
  if (!jobId)
    return Response.json({ error: "jobId required" }, { status: 400 });
  if (!freelancerClerkId)
    return Response.json(
      { error: "freelancerClerkId required" },
      { status: 400 },
    );

  const jobResult = await db.query(
    "SELECT id, client_id, deadline, title FROM fm_jobs WHERE id = $1",
    [jobId],
  );
  const job = jobResult.rows[0];
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  const clientResult = await db.query(
    "SELECT id FROM fm_clients WHERE clerk_id = $1",
    [userId],
  );
  const clientId = clientResult.rows[0]?.id;
  if (!clientId || clientId !== job.client_id) {
    return Response.json(
      { error: "Only the job client can accept this proposal" },
      { status: 403 },
    );
  }

  const existingContract = await db.query(
    "SELECT id FROM fm_contracts WHERE job_id = $1 LIMIT 1",
    [jobId],
  );
  if (existingContract.rows.length > 0) {
    return Response.json(
      { error: "Proposal already accepted" },
      { status: 409 },
    );
  }

  const proposalMsg = await db.query(
    `SELECT m.conversation_id, m.sender_id
     FROM fm_messages m
     WHERE m.content::jsonb->>'type' = 'proposal' AND m.content::jsonb->>'jobId' = $1
       AND m.sender_id = $2
     LIMIT 1`,
    [jobId, freelancerClerkId],
  );
  const proposal = proposalMsg.rows[0];
  if (!proposal)
    return Response.json({ error: "Proposal not found" }, { status: 404 });

  const freelancerResult = await db.query(
    "SELECT id FROM fm_freelancers WHERE clerk_id = $1",
    [proposal.sender_id],
  );
  const freelancerId = freelancerResult.rows[0]?.id;
  if (!freelancerId)
    return Response.json({ error: "Freelancer not found" }, { status: 404 });

  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = job.deadline
    ? new Date(job.deadline).toISOString().slice(0, 10)
    : null;

  await db.query(
    `INSERT INTO fm_contracts (job_id, client_id, freelancer_id, start_date, end_date, status)
     VALUES ($1, $2, $3, $4, $5, 'active')`,
    [jobId, job.client_id, freelancerId, startDate, endDate],
  );

  const acceptedContent = JSON.stringify({
    type: "proposal_accepted",
    text: "Proposal accepted",
    jobId,
    jobTitle: job.title || "Job",
    startDate,
    endDate,
  });
  const insertMsg = await db.query(
    "INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id",
    [proposal.conversation_id, proposal.sender_id, acceptedContent],
  );
  const messageId = insertMsg.rows[0].id;

  let avatarUrl = null;
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const user = await clerk.users.getUser(proposal.sender_id);
    avatarUrl = user?.imageUrl ?? null;
  } catch {
    // use fallback in UI
  }

  const channelSlug = "dm-" + [userId, proposal.sender_id].sort().join("-");
  const channelName = "chat:" + channelSlug;
  const apiKey =
    process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      const rest = new Ably.Rest(apiKey);
      const channel = rest.channels.get(channelName);
      await channel.publish("ADD", {
        id: messageId,
        text: "Proposal accepted",
        messageType: "proposal_accepted",
        acceptedJobId: jobId,
        jobTitle: job.title || "Job",
        startDate,
        endDate,
        senderId: proposal.sender_id,
        avatarUrl,
      });
    } catch (err) {
      console.error("Ably publish failed:", err);
    }
  }

  const otherProposals = await db.query(
    `SELECT m.conversation_id, m.sender_id
     FROM fm_messages m
     WHERE m.content::jsonb->>'type' = 'proposal' AND m.content::jsonb->>'jobId' = $1
       AND m.sender_id != $2`,
    [jobId, proposal.sender_id],
  );

  let clientAvatarUrl = null;
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const clientUser = await clerk.users.getUser(userId);
    clientAvatarUrl = clientUser?.imageUrl ?? null;
  } catch {
    // use fallback in UI
  }

  const deniedText = "Contract started with another freelancer";
  const apiKeyForDeny =
    process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_API_KEY;

  for (const other of otherProposals.rows) {
    const deniedContent = JSON.stringify({
      type: "proposal_denied",
      text: deniedText,
      jobId,
    });
    const insertDenied = await db.query(
      "INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id",
      [other.conversation_id, userId, deniedContent],
    );
    const deniedMsgId = insertDenied.rows[0].id;

    if (apiKeyForDeny) {
      try {
        const rest = new Ably.Rest(apiKeyForDeny);
        const otherChannelSlug =
          "dm-" + [userId, other.sender_id].sort().join("-");
        const otherChannel = rest.channels.get("chat:" + otherChannelSlug);
        await otherChannel.publish("ADD", {
          id: deniedMsgId,
          text: deniedText,
          messageType: "proposal_denied",
          deniedJobId: jobId,
          senderId: userId,
          avatarUrl: clientAvatarUrl,
        });
      } catch (err) {
        console.error("Ably publish (deny other) failed:", err);
      }
    }
  }

  return Response.json({ ok: true });
};
