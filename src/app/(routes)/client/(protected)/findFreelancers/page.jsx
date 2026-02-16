import { db } from "@/lib/dbConnection";

export default async function clientFindFreelancersPage() {
  const { rows } = await db.query(`SELECT * FROM fm_freelancers`);

  const freelancers = rows.map((freelancer) => ({
    ...freelancer,
    skills:
      typeof freelancer.skills === "string"
        ? JSON.parse(freelancer.skills)
        : (freelancer.skills ?? []),
  }));

  return (
    <div className="all-client-jobs-container">
      {freelancers.map((freelancer) => (
        <div className="client-job-container" key={freelancer.id}>
          <h1 className="job-title">Username : {freelancer.name}</h1>
          <p className="profile-bio">Bio : {freelancer.bio}</p>

          <div className="specific-jobs-details">
            <div>
              <h2 className="profile-skills">
                <strong>Skills:</strong>
              </h2>
              <ul className="profile-skills">
                {freelancer.skills.map((skill, index) => (
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
  );
}
