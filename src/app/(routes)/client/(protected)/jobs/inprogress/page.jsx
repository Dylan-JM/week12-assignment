import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";
import ClientSideBar from "@/components/ClientSideBar";

export default async function ClientJobsInProgressPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const { rows: clientRows } = await db.query(
    `SELECT id FROM fm_clients WHERE clerk_id = $1`,
    [userId],
  );

  if (!clientRows.length) {
    return <div>No client found</div>;
  }

  const rawClientId = clientRows[0].id;

  const { rows: jobs } = await db.query(
    `SELECT * FROM fm_jobs WHERE client_id = $1`,
    [rawClientId],
  );

  const jobLookup = Object.fromEntries(jobs.map((job) => [job.id, job]));

  const jobIds = jobs.map((job) => job.id);

  if (!jobIds.length) {
    return <div>No jobs found</div>;
  }

  const { rows: jobsInProgress } = await db.query(
    `SELECT * FROM fm_contracts WHERE job_id = ANY($1)`,
    [jobIds],
  );

  const freelancerIds = jobsInProgress.map(
    (contract) => contract.freelancer_id,
  );

  const { rows: freelancers } = await db.query(
    `SELECT id, name FROM fm_freelancers WHERE id = ANY($1)`,
    [freelancerIds],
  );

  const freelancerLookup = Object.fromEntries(
    freelancers.map((freelancer) => [freelancer.id, freelancer]),
  );

  return (
    <>
      <div className="sidebar-main-container">
        <ClientSideBar />
        <div className="all-client-jobs-container">
          <h1>
            <strong className="jobs-in-progress-title">Jobs In Progress</strong>
          </h1>
          {jobsInProgress.map((post) => {
            const job = jobLookup[post.job_id];
            const freelancer = freelancerLookup[post.freelancer_id];

            return (
              <div className="client-job-container" key={post.id}>
                <h1 className="job-title">{job.title || "Untitled Job"}</h1>
                <p>
                  <strong>Freelancer:</strong>{" "}
                  {freelancer?.name || "Unassigned"}
                </p>

                <p className="job-description">
                  {job?.description || "No description available"}
                </p>
                <h2 className="job-skills-required-title">
                  <strong>Skills Required:</strong>
                </h2>
                <ul>
                  {job.skills_required.map((skill, index) => (
                    <li className="job-skill" key={index}>
                      {skill}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>Category:</strong> {job.category}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(post.start_date).toLocaleDateString()}
                </p>

                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(post.end_date).toLocaleDateString()}
                </p>

                <p>
                  <strong>Status:</strong> {post.status}
                </p>

                <p>
                  <strong>Budget:</strong> £{job.budget}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
