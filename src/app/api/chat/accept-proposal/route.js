import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

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
    "SELECT id, client_id, deadline FROM fm_jobs WHERE id = $1",
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
    return Response.json({ error: "Only the job client can accept this proposal" }, { status: 403 });
  }

  const existingContract = await db.query(
    "SELECT id FROM fm_contracts WHERE job_id = $1 LIMIT 1",
    [jobId]
  );
  if (existingContract.rows.length > 0) {
    return Response.json({ error: "Proposal already accepted" }, { status: 409 });
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

  const freelancerResult = await db.query(
    "SELECT id FROM fm_freelancers WHERE clerk_id = $1",
    [proposal.sender_id]
  );
  const freelancerId = freelancerResult.rows[0]?.id;
  if (!freelancerId) return Response.json({ error: "Freelancer not found" }, { status: 404 });

  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = job.deadline
    ? new Date(job.deadline).toISOString().slice(0, 10)
    : null;

  await db.query(
    `INSERT INTO fm_contracts (job_id, client_id, freelancer_id, start_date, end_date, status)
     VALUES ($1, $2, $3, $4, $5, 'active')`,
    [jobId, job.client_id, freelancerId, startDate, endDate]
  );

  const acceptedContent = JSON.stringify({
    type: "proposal_accepted",
    text: "Proposal accepted",
  });
  await db.query(
    "INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)",
    [proposal.conversation_id, userId, acceptedContent]
  );

  return Response.json({ ok: true });
};
