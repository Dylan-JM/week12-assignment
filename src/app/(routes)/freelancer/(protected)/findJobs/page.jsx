import { db } from "@/lib/dbConnection";
import Link from "next/link";
import JobSortDropdown from "@/components/job-sort-dropdown";

export default async function freelancerFindJobs({ searchParams }) {
  const params = await searchParams;
  const sortParam = params?.sort;
  const sort =
    sortParam === "oldest" ||
    sortParam === "budget_high" ||
    sortParam === "budget_low"
      ? sortParam
      : "latest";

  let orderBy;
  if (sort === "budget_high") orderBy = "j.budget DESC NULLS LAST";
  else if (sort === "budget_low") orderBy = "j.budget ASC NULLS LAST";
  else if (sort === "oldest") orderBy = "j.created_at ASC NULLS LAST";
  else orderBy = "j.created_at DESC NULLS LAST";

  const { rows } = await db.query(
    `SELECT * FROM fm_jobs j
     WHERE NOT EXISTS (
       SELECT 1 FROM fm_contracts c WHERE c.job_id = j.id AND c.status = 'active'
     )
     ORDER BY ${orderBy}`,
  );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <JobSortDropdown currentSort={sort} />
      </div>
      <div className="all-client-jobs-container">
        {rows.map((post) => (
          <Link href={`/freelancer/findJobs/${post.id}`} key={post.id}>
            <div className="client-job-container">
              <h1 className="job-title">{post.title}</h1>
              <p className="job-description">
                Description : {post.description}
              </p>
              <div className="specific-jobs-details">
                <h2 className="job-budget">Budget : £{post.budget}</h2>
                <h2 className="job-deadline">
                  Deadline: {new Date(post.deadline).toLocaleDateString()}
                </h2>
                <h2 className="job-created">
                  Posted: {new Date(post.created_at).toLocaleDateString()}
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
          </Link>
        ))}
      </div>
    </>
  );
}
