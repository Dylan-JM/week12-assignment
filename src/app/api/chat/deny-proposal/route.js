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

  const jobResult = await db.query(
    "SELECT id, client_id FROM fm_jobs WHERE id = $1",
    [jobId]
  );
  const job = jobResult.rows[0];
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  const clientResult = await db.query(
    "SELECT id FROM fm_clients WHERE clerk_id = $1",
    [userId]
  );
  const clientId = clientResult.rows[0]?.id;
  if (!clientId || clientId !== job.client_id) {
    return Response.json({ error: "Only the job client can deny this proposal" }, { status: 403 });
  }

  const existingContract = await db.query(
    "SELECT id FROM fm_contracts WHERE job_id = $1 LIMIT 1",
    [jobId]
  );
  if (existingContract.rows.length > 0) {
    return Response.json({ error: "Proposal already accepted" }, { status: 409 });
  }

  const alreadyDenied = await db.query(
    `SELECT 1 FROM fm_messages
     WHERE content::jsonb->>'type' = 'proposal_denied' AND content::jsonb->>'jobId' = $1
     LIMIT 1`,
    [jobId]
  );
  if (alreadyDenied.rows.length > 0) {
    return Response.json({ error: "Proposal already denied" }, { status: 409 });
  }

  const proposalMsg = await db.query(
    `SELECT m.conversation_id, m.sender_id
     FROM fm_messages m
     WHERE m.content::jsonb->>'type' = 'proposal' AND m.content::jsonb->>'jobId' = $1
     LIMIT 1`,
    [jobId]
  );
  const proposal = proposalMsg.rows[0];
  if (!proposal) return Response.json({ error: "Proposal not found" }, { status: 404 });

  const deniedContent = JSON.stringify({
    type: "proposal_denied",
    text: "Proposal denied",
    jobId,
  });
  const insertMsg = await db.query(
    "INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id",
    [proposal.conversation_id, userId, deniedContent]
  );
  const messageId = insertMsg.rows[0].id;

  let avatarUrl = null;
  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(userId);
    avatarUrl = user?.imageUrl ?? null;
  } catch {
    // use fallback in UI
  }

  const channelSlug = "dm-" + [userId, proposal.sender_id].sort().join("-");
  const channelName = "chat:" + channelSlug;
  const apiKey = process.env.ABLY_API_KEY || process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      const rest = new Ably.Rest(apiKey);
      const channel = rest.channels.get(channelName);
      await channel.publish("ADD", {
        id: messageId,
        text: "Proposal denied",
        messageType: "proposal_denied",
        deniedJobId: jobId,
        senderId: userId,
        avatarUrl,
      });
    } catch (err) {
      console.error("Ably publish failed:", err);
    }
  }

  return Response.json({ ok: true });
};
