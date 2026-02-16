import { db } from "@/lib/dbConnection";
import FreelancersList from "@/components/FreelancersList";

export default async function ClientFindFreelancersPage() {
  const { rows } = await db.query(`SELECT * FROM fm_freelancers`);

  const freelancers = rows.map((freelancer) => ({
    ...freelancer,
    skills:
      typeof freelancer.skills === "string"
        ? JSON.parse(freelancer.skills)
        : (freelancer.skills ?? []),
  }));

  return <FreelancersList freelancers={freelancers} />;
}
