import { db } from "@/lib/dbConnection";
import { getTierForClerkId } from "@/lib/helperFunctions";
import FreelancersList from "@/components/FreelancersList";

const TIER_ORDER = { pro: 0, advanced: 1, free: 2 };

export const metadata = {
  title: "Find Freelancers",
  description: "Browse freelancer profiles, skills, and rates. Find the right talent for your project on TrueHire.",
};

export default async function ClientFindFreelancersPage() {
  const { rows } = await db.query(`SELECT * FROM fm_freelancers`);

  const freelancersWithTier = await Promise.all(
    rows.map(async (freelancer) => {
      const tier = freelancer.clerk_id
        ? await getTierForClerkId(freelancer.clerk_id)
        : null;
      const sortTier = tier ?? "free";
      return {
        ...freelancer,
        skills:
          typeof freelancer.skills === "string"
            ? JSON.parse(freelancer.skills)
            : (freelancer.skills ?? []),
        tier: sortTier,
        _sortOrder: TIER_ORDER[sortTier] ?? TIER_ORDER.free,
      };
    })
  );

  const freelancers = freelancersWithTier
    .sort((a, b) => a._sortOrder - b._sortOrder)
    .map(({ _sortOrder, ...f }) => f);

  return <FreelancersList freelancers={freelancers} />;
}
