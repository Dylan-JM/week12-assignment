import { db } from "@/lib/dbConnection";
import Link from "next/link";
import { Coins, Gem } from "lucide-react";
import JobSortDropdown from "@/components/job-sort-dropdown";

function getJobTier(budget) {
  const b = Number(budget) || 0;
  if (b < 250) return "free";
  if (b < 1000) return "advanced";
  return "premium";
}

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
        {rows.map((post) => {
          const tier = getJobTier(post.budget);
          return (
            <Link href={`/freelancer/findJobs/${post.id}`} key={post.id}>
              <div className="client-job-container relative">
                {tier === "advanced" && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                    <Coins className="h-5 w-5" />
                    <span className="text-sm font-medium">Advanced</span>
                  </div>
                )}
                {tier === "premium" && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-violet-100 px-2 py-1 text-violet-800">
                    <Gem className="h-5 w-5" />
                    <span className="text-sm font-medium">Premium</span>
                  </div>
                )}
                <h1 className="job-title pr-32">{post.title}</h1>
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
          );
        })}
      </div>
    </>
  );
}
