import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import FreelancerSideBar from "@/components/FreelancerSideBar";

export default async function FreelancerJobsPage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const { rows: freelancers } = await db.query(
    `SELECT id FROM fm_freelancers WHERE clerk_id = $1`,
    [userId],
  );

  if (freelancers.length === 0) {
    return <div>No freelancer profile found.</div>;
  }

  const freelancerId = freelancers[0].id;

  const { rows: contracts } = await db.query(
    `SELECT job_id FROM fm_contracts WHERE freelancer_id = $1`,
    [freelancerId],
  );

  if (contracts.length === 0) {
    return <div>No contracts found.</div>;
  }

  const jobIds = contracts.map((c) => c.job_id);

  const { rows: jobs } = await db.query(
    `SELECT * FROM fm_jobs WHERE id = ANY($1)`,
    [jobIds],
  );

  return (
    <div className="sidebar-main-container">
      <FreelancerSideBar />
      <div className="active-jobs-container">
        <h1 className="active-jobs-title">Jobs</h1>
        {jobs.map((job) => (
          <Link href={`/freelancer/jobs/${job.id}`} key={job.id}>
            <div className="client-job-container">
              <h1 className="job-title">{job.title}</h1>
              <p className="job-description">Description : {job.description}</p>

              <div className="specific-jobs-details">
                <h2 className="job-budget">Budget : £{job.budget}</h2>
                <h2 className="job-deadline">
                  Deadline :{" "}
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString()
                    : "No deadline"}
                </h2>
                <h2 className="job-category">Category : {job.category}</h2>
                <div>
                  <h2 className="job-skills-required-title">
                    Skills Required:
                  </h2>
                  <ul>
                    {job.skills_required.map((skill, index) => (
                      <li className="job-skill" key={index}>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
