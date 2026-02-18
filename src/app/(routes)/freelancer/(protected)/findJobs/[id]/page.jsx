import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";
import { Coins, Gem } from "lucide-react";
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
    <>
      <h1>Job Page</h1>
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
        return (
          <div key={job.id} className="relative rounded-lg border p-6">
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
            <h1 className="specific-job-title pr-32">{job.title}</h1>
            <p className="column-info">{job.description}</p>
            <p className="column-info">{job.budget}</p>
            <p className="column-info">
              {job.deadline
                ? new Date(job.deadline).toLocaleDateString()
                : "No deadline"}
            </p>
            {job.created_at && (
              <p className="column-info">
                Posted: {new Date(job.created_at).toLocaleDateString()}
              </p>
            )}
            <p className="column-info">{job.category}</p>
            <p className="column-info">{job.skills_required}</p>
            <p>${Number(job.budget).toFixed(2)}</p>
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
    </>
  );
}
