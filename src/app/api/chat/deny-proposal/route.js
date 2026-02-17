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
  const { jobId } = body;
  if (!jobId) return Response.json({ error: "jobId required" }, { status: 400 });

  // Load job and ensure caller is the job’s client.
  const jobRow = await db.query(
    `SELECT id, client_id FROM fm_jobs WHERE id = $1`,
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
    return Response.json({ error: "Only the job client can deny this proposal" }, { status: 403 });
  }

  // Ensure no contract exists for this job.
  const contractRow = await db.query(
    `SELECT id FROM fm_contracts WHERE job_id = $1 LIMIT 1`,
    [jobId],
  );
  if (contractRow.rows.length > 0) {
    return Response.json({ error: "Proposal already accepted" }, { status: 409 });
  }

  // Check if this proposal was already denied.
  const deniedRow = await db.query(
    `SELECT 1 FROM fm_messages WHERE content LIKE '%"type":"proposal_denied"%' AND content LIKE '%"jobId":"' || $1 || '"%' LIMIT 1`,
    [jobId],
  );
  if (deniedRow.rows.length > 0) {
    return Response.json({ error: "Proposal already denied" }, { status: 409 });
  }

  // Find the proposal message for this job.
  const proposalRow = await db.query(
    `SELECT conversation_id, sender_id FROM fm_messages WHERE content LIKE '%"type":"proposal"%' AND content LIKE '%"jobId":"' || $1 || '"%' LIMIT 1`,
    [jobId],
  );
  const proposal = proposalRow.rows[0];
  if (!proposal) return Response.json({ error: "Proposal not found" }, { status: 404 });

  const deniedContent = JSON.stringify({ type: "proposal_denied", text: "Proposal denied", jobId });
  // Insert “proposal denied” message in the conversation.
  const msgRow = await db.query(
    `INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
    [proposal.conversation_id, userId, deniedContent],
  );
  const messageId = msgRow.rows[0].id;

  let avatarUrl = null;
  try {
    const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(userId);
    avatarUrl = user?.imageUrl ?? null;
  } catch {}

  const channelSlug = "dm-" + [userId, proposal.sender_id].sort().join("-");
  const apiKey = process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      await new Ably.Rest(apiKey).channels.get("chat:" + channelSlug).publish("ADD", {
        id: messageId,
        text: "Proposal denied",
        messageType: "proposal_denied",
        deniedJobId: jobId,
        senderId: userId,
        avatarUrl,
      });
    } catch {}
  }

  return Response.json({ ok: true });
};
