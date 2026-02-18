import { db } from "@/lib/dbConnection";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "My Jobs",
  description: "View and manage your posted jobs on TrueHire.",
};

export default async function clientPage() {
  const { userId } = await auth();

  console.log(userId);

  const { rows: client_id } = await db.query(
    `SELECT id FROM fm_clients WHERE clerk_id = $1`,
    [userId],
  );

  const rawClientId = client_id[0].id;

  const { rows } = await db.query(
    `SELECT * FROM fm_jobs WHERE client_id = $1`,
    [rawClientId],
  );

  if (!rows || rows.length === 0) {
    return (
      <>
        <p>No Jobs Found!</p>
      </>
    );
  }

  return (
    <>
      <div className="all-client-jobs-container">
        {rows.map((post) => (
          <Link href={`/client/jobs/${post.id}`} key={post.id}>
            <div className="client-job-container">
              <h1 className="job-title">{post.title}</h1>
              <p className="job-description">
                <strong>Description : </strong>
                {post.description}
              </p>
              <div className="specific-jobs-details">
                <h2 className="job-budget">Budget : £{post.budget}</h2>
                <h2 className="job-deadline">
                  Deadline: {new Date(post.deadline).toLocaleDateString()}
                </h2>

                <h2 className="job-category">
                  <strong>Category : </strong>
                  {post.category}
                </h2>
                <div>
                  <h2 className="job-skills-required-title">
                    <strong>Skills Required:</strong>
                  </h2>
                  <ul>
                    {post.skills_required.map((skill, index) => (
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
    </>
  );
}
