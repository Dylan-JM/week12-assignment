import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";
import { Coins, Gem, Calendar, Clock, Briefcase } from "lucide-react";
import ProposalForm from "@/components/proposal-form";

function getJobTier(budget) {
  const b = Number(budget) || 0;
  if (b < 250) return "free";
  if (b < 1000) return "advanced";
  return "premium";
}

export default async function SpecificJobPage({ params }) {
  const { userId, has } = await auth();

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
    <div className="all-client-jobs-container">
      {jobDetails.map((job) => {
        const tier = getJobTier(job.budget);
        const userTier = has({ plan: "pro" })
          ? "pro"
          : has({ plan: "advanced" }) || has({ feature: "25_proposals_month" })
            ? "advanced"
            : "free";
        const canApply =
          tier === "free" ||
          (tier === "advanced" &&
            (userTier === "advanced" || userTier === "pro")) ||
          (tier === "premium" && userTier === "pro");
        const requiredTier = !canApply
          ? tier === "premium"
            ? "Pro"
            : tier === "advanced"
              ? "Advanced"
              : null
          : null;
        const skills = Array.isArray(job.skills_required)
          ? job.skills_required
          : typeof job.skills_required === "string"
            ? (() => {
                try {
                  const parsed = JSON.parse(job.skills_required);
                  return Array.isArray(parsed) ? parsed : [job.skills_required];
                } catch {
                  return [job.skills_required];
                }
              })()
            : [];
        return (
          <div
            key={job.id}
            className={`client-job-container relative freelancer-job-detail freelancer-job-detail--${tier}`}
          >
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
            <h1 className="job-title job-detail-title">{job.title}</h1>
            <div className="editable-job-field m-2 text-xl job-description">
              <strong>Description:</strong> {job.description || "—"}
            </div>
            <div className="freelancer-job-meta">
              <p className="job-budget freelancer-job-meta-item">
                £{Number(job.budget).toFixed(2)}
              </p>
              <div className="editable-job-field m-2 text-xl freelancer-job-meta-item">
                <Calendar className="freelancer-job-meta-icon" aria-hidden />
                <strong>Deadline:</strong>{" "}
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString()
                  : "No deadline"}
              </div>
              {job.created_at && (
                <div className="editable-job-field m-2 text-xl freelancer-job-meta-item">
                  <Clock className="freelancer-job-meta-icon" aria-hidden />
                  <strong>Posted:</strong>{" "}
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
            {job.category && (
              <span className="job-category freelancer-job-category">
                <Briefcase className="freelancer-job-category-icon" aria-hidden />
                {job.category}
              </span>
            )}
            {skills.length > 0 && (
              <div className="editable-job-skills m-2 text-xl">
                <h2 className="job-skills-required-title">
                  <strong>Skills Required:</strong>
                </h2>
                <ul>
                  {skills.map((skill, index) => (
                    <li key={index} className="job-skill">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4">
              <ProposalForm
                jobId={job.id}
                alreadyProposed={alreadyProposed}
                canApply={canApply}
                requiredTier={requiredTier}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
