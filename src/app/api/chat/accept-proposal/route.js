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

  // Load job and ensure caller is the job’s client.
  const jobRow = await db.query(
    `SELECT id, client_id, deadline, title FROM fm_jobs WHERE id = $1`,
    [jobId],
  );
  const job = jobRow.rows[0];
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  const clientRow = await db.query(
    `SELECT id FROM fm_clients WHERE clerk_id = $1`,
    [userId],
  );
  const clientId = clientRow.rows[0]?.id;
  if (!clientId || clientId !== job.client_id) {
    return Response.json({ error: "Only the job client can accept this proposal" }, { status: 403 });
  }

  // Ensure no contract exists yet for this job.
  const contractRow = await db.query(
    `SELECT id FROM fm_contracts WHERE job_id = $1 LIMIT 1`,
    [jobId],
  );
  if (contractRow.rows.length > 0) {
    return Response.json({ error: "Proposal already accepted" }, { status: 409 });
  }

  // Find the proposal message for this job from this freelancer.
  const proposalRow = await db.query(
    `SELECT conversation_id, sender_id FROM fm_messages WHERE content LIKE '%"type":"proposal"%' AND content LIKE '%"jobId":"' || $1 || '"%' AND sender_id = $2 LIMIT 1`,
    [jobId, freelancerClerkId],
  );
  const proposal = proposalRow.rows[0];
  if (!proposal) return Response.json({ error: "Proposal not found" }, { status: 404 });

  const freelancerRow = await db.query(
    `SELECT id FROM fm_freelancers WHERE clerk_id = $1`,
    [proposal.sender_id],
  );
  const freelancerId = freelancerRow.rows[0]?.id;
  if (!freelancerId) return Response.json({ error: "Freelancer not found" }, { status: 404 });

  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = job.deadline
    ? new Date(job.deadline).toISOString().slice(0, 10)
    : null;

  // Create active contract for this job and freelancer.
  await db.query(
    `INSERT INTO fm_contracts (job_id, client_id, freelancer_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, 'active')`,
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
  // Insert “proposal accepted” message in the client–freelancer conversation.
  const msgRow = await db.query(
    `INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
    [proposal.conversation_id, proposal.sender_id, acceptedContent],
  );
  const messageId = msgRow.rows[0].id;

  let avatarUrl = null;
  try {
    const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(proposal.sender_id);
    avatarUrl = user?.imageUrl ?? null;
  } catch {}

  const channelSlug = "dm-" + [userId, proposal.sender_id].sort().join("-");
  const apiKey = process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      await new Ably.Rest(apiKey).channels.get("chat:" + channelSlug).publish("ADD", {
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
    } catch {}
  }

  // Find other proposal messages for this job (other freelancers) to auto-deny.
  const otherRow = await db.query(
    `SELECT conversation_id, sender_id FROM fm_messages WHERE content LIKE '%"type":"proposal"%' AND content LIKE '%"jobId":"' || $1 || '"%' AND sender_id != $2`,
    [jobId, proposal.sender_id],
  );

  let clientAvatarUrl = null;
  try {
    const clientUser = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(userId);
    clientAvatarUrl = clientUser?.imageUrl ?? null;
  } catch {}

  const deniedText = "Contract started with another freelancer";
  for (const other of otherRow.rows) {
    const deniedContent = JSON.stringify({ type: "proposal_denied", text: deniedText, jobId });
    // Insert “proposal denied” message for each other freelancer who proposed.
    const deniedMsgRow = await db.query(
      `INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
      [other.conversation_id, userId, deniedContent],
    );
    const deniedMsgId = deniedMsgRow.rows[0].id;
    if (apiKey) {
      try {
        await new Ably.Rest(apiKey).channels.get("chat:" + "dm-" + [userId, other.sender_id].sort().join("-")).publish("ADD", {
          id: deniedMsgId,
          text: deniedText,
          messageType: "proposal_denied",
          deniedJobId: jobId,
          senderId: userId,
          avatarUrl: clientAvatarUrl,
        });
      } catch {}
    }
  }

  return Response.json({ ok: true });
};
