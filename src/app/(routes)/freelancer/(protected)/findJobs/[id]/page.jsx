import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";
import ProposalForm from "@/components/proposal-form";

export default async function SpecificJobPage({ params }) {
  const { userId } = await auth();

  const { id } = await params;

  const { rows: jobDetails } = await db.query(
    `SELECT * FROM fm_jobs
    WHERE id = $1`,
    [id],
  );

  let alreadyProposed = false;
  if (jobDetails.length > 0 && userId) {
    const job = jobDetails[0];
    const { rows: proposalRows } = await db.query(
      `SELECT 1 FROM (
         SELECT content FROM fm_messages
         WHERE sender_id = $1 AND content ~ '^\\s*\\{'
       ) sub
       WHERE sub.content::jsonb->>'type' = 'proposal' AND sub.content::jsonb->>'jobId' = $2
       LIMIT 1`,
      [userId, job.id],
    );
    alreadyProposed = proposalRows.length > 0;
  }

  return (
    <>
      <h1>Job Page</h1>
      {jobDetails.map((job) => (
        <div key={job.id}>
          <h1 className="specific-job-title">{job.title}</h1>
          <p className="column-info">{job.description}</p>
          <p className="column-info">{job.budget}</p>
          <p className="column-info">
            {job.deadline
              ? new Date(job.deadline).toLocaleDateString()
              : "No deadline"}
          </p>
          <p className="column-info">
            Posted: {new Date(job.created_at).toLocaleDateString()}
          </p>
          <p className="column-info">{job.category}</p>
          <p className="column-info">{job.skills_required}</p>
          <p>${Number(job.budget).toFixed(2)}</p>
          <div className="mt-4">
            <ProposalForm jobId={job.id} alreadyProposed={alreadyProposed} />
          </div>
        </div>
      ))}
    </>
  );
}
