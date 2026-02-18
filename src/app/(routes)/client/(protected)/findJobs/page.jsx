import { db } from "@/lib/dbConnection";
import ClientSideBar from "@/components/ClientSideBar";

export const metadata = {
  title: "Browse Jobs",
  description:
    "Explore all jobs posted on TrueHire. See what other clients are looking for.",
};

export default async function clientFindAllJobsPage() {
  const { rows } = await db.query(`SELECT * FROM fm_jobs`);

  return (
    <>
      <div className="sidebar-main-container">
        <ClientSideBar />
        <div className="all-client-jobs-container">
          <h1 className="client-jobs-title">All Jobs</h1>
          {rows.map((post) => (
            <div className="client-job-container" key={post.id}>
              <h1 className="job-title">{post.title}</h1>
              <p className="job-description">
                Description : {post.description}
              </p>
              <div className="specific-jobs-details">
                <h2 className="job-budget">Budget : £{post.budget}</h2>
                <h2 className="job-deadline">
                  Deadline: {new Date(post.deadline).toLocaleDateString()}
                </h2>

                <h2 className="job-category">Category : {post.category}</h2>
                <div>
                  <h2 className="job-skills-required-title">
                    Skills Required:
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
          ))}
        </div>
      </div>
    </>
  );
}
