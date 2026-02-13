import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function FreelancerProfilePage({ params }) {
  const { id } = await params;

  const skillOptions = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "PostgreSQL",
    "MongoDB",
    "Tailwind CSS",
    "Figma",
    "SEO",
    "Content Writing",
  ];

  const { rows: userDetails } = await db.query(
    `SELECT * FROM fm_users
      WHERE clerk_id = $1`,
    [id],
  );

  const { rows: clientDetails } = await db.query(
    `SELECT * FROM fm_clients
      WHERE clerk_id = $1`,
    [id],
  );

  const { rows: freelancerDetails } = await db.query(
    `SELECT * FROM fm_freelancers
      WHERE clerk_id = $1`,
    [id],
  );

  const username =
    userDetails[0].role === "client"
      ? clientDetails[0]?.name
      : userDetails[0].role === "freelancer"
        ? freelancerDetails[0]?.name
        : "Unknown";

  const bio =
    userDetails[0].role === "client"
      ? clientDetails[0]?.bio
      : userDetails[0].role === "freelancer"
        ? freelancerDetails[0]?.bio
        : "Unknown";

  async function handleSubmit(formData) {
    "use server";
    const newSkills = formData.getAll("skills");

    const { rows: freelancerRows } = await db.query(
      `SELECT skills FROM fm_freelancers WHERE clerk_id = $1`,
      [id],
    );

    const existingSkills = freelancerRows[0]?.skills || [];

    const updatedSkills = Array.from(
      new Set([...existingSkills, ...newSkills]),
    );

    await db.query(
      `UPDATE fm_freelancers
     SET skills = $1
     WHERE clerk_id = $2`,
      [JSON.stringify(updatedSkills), id],
    );

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  return (
    <>
      <div className="user-profile-container">
        <h1 className="profile-title">Profile</h1>
        <div className="user-details">
          <div className="profile-skills-form-contents">
            <p>Profile ID: {id}</p>
            <p>Role: {userDetails[0].role}</p>
            <p>Username: {username}</p>
            <p>Bio: {bio}</p>
            <ul className="profile-skills">
              {freelancerDetails[0]?.skills?.length > 0 ? (
                freelancerDetails[0].skills.map((skill, index) => (
                  <li className="job-skill" key={index}>
                    {skill}
                    <form
                      action={async (formData) => {
                        "use server";
                        const skillToDelete = formData.get("skill");

                        const { rows: freelancerRows } = await db.query(
                          `SELECT skills FROM fm_freelancers WHERE clerk_id = $1`,
                          [id],
                        );
                        const existingSkills = freelancerRows[0]?.skills || [];
                        const updatedSkills = existingSkills.filter(
                          (s) => s !== skillToDelete,
                        );

                        await db.query(
                          `UPDATE fm_freelancers SET skills = $1 WHERE clerk_id = $2`,
                          [JSON.stringify(updatedSkills), id],
                        );

                        revalidatePath(`/freelancer/profile/${id}`);
                        redirect(`/freelancer/profile/${id}`);
                      }}
                      style={{ display: "inline-block", marginLeft: "8px" }}
                    >
                      <input type="hidden" name="skill" value={skill} />
                      <button type="submit" className="delete-skill-btn">
                        X
                      </button>
                    </form>
                  </li>
                ))
              ) : (
                <li>No skills added yet.</li>
              )}
            </ul>
          </div>
          <form action={handleSubmit} className="profile-skills-form-contents">
            <div className="client-job-form-group">
              <div className="profile-skills-container">
                {skillOptions.map((skill) => (
                  <div className="skill-add-conatiner">
                    <label key={skill} className="checkbox-label">
                      <input
                        type="checkbox"
                        className="profile-skill-input"
                        name="skills"
                        value={skill}
                      />
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button className="submit-btn" type="submit">
              Add Skills
            </button>
          </form>
        </div>
      </div>
      <div className="user-profile-container">
        <h1 className="profile-title">About</h1>
        <div className="user-details">
          <p>About Content Here</p>
          <p>About Content Here</p>
          <p>About Content Here</p>
          <p>About Content Here</p>
          <p>About Content Here</p>
          <p>About Content Here</p>
        </div>
      </div>
    </>
  );
}
