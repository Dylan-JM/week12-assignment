import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";

export default async function SpecificJobPage({ params }) {
  const { userId } = await auth();

  const { id } = await params;

  const { rows: jobDetails } = await db.query(
    `SELECT * FROM fm_jobs
    WHERE id = $1`,
    [id],
  );

  return (
    <>
      <h1>Job Page</h1>
      {jobDetails.map((job) => (
        <div key={job.id}>
          <h1 className="specific-job-title">{job.title}</h1>
          <p className="column-info">{job.description}</p>
          <p className="column-info">{job.budget}</p>
          <p className="column-info">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</p>
          <p className="column-info">{job.category}</p>
          <p className="column-info">{job.skills_required}</p>
          <p>${Number(job.budget).toFixed(2)}</p>
        </div>
      ))}
    </>
  );
}
