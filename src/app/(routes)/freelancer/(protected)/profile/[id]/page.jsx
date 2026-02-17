import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import EditableUsername from "@/components/EditableUsername";
import Editablebio from "@/components/EditBio";
import EditableHourlyRate from "@/components/EditableHourlyRate";

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

  const hourly_rate =
    userDetails[0].role === "freelancer"
      ? freelancerDetails[0]?.hourly_rate
      : null;

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

  async function handleUsernameChange(formData) {
    "use server";

    const name = formData.get("name");

    await db.query(
      `UPDATE fm_freelancers
     SET name = $1
     WHERE clerk_id = $2`,
      [name, id],
    );

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  async function handleBioChange(formData) {
    "use server";

    const bio = formData.get("bio");

    await db.query(
      `UPDATE fm_freelancers
     SET bio = $1
     WHERE clerk_id = $2`,
      [bio, id],
    );

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  async function handleHourlyRateChange(formData) {
    "use server";

    const hourly_rate = formData.get("hourly_rate");

    await db.query(
      `UPDATE fm_freelancers
     SET hourly_rate = $1
     WHERE clerk_id = $2`,
      [hourly_rate, id],
    );

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  async function handleAddLink(formData) {
    "use server";

    const newLink = formData.get("link");

    if (!newLink) return;

    const { rows: freelancerRows } = await db.query(
      `SELECT links FROM fm_freelancers WHERE clerk_id = $1`,
      [id],
    );

    const existingLinks = freelancerRows[0]?.links || [];
    const updatedLinks = Array.from(new Set([...existingLinks, newLink]));

    await db.query(`UPDATE fm_freelancers SET links = $1 WHERE clerk_id = $2`, [
      JSON.stringify(updatedLinks),
      id,
    ]);

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  async function handleDeleteLink(formData) {
    "use server";

    const linkToDelete = formData.get("link");

    const { rows: freelancerRows } = await db.query(
      `SELECT links FROM fm_freelancers WHERE clerk_id = $1`,
      [id],
    );

    const existingLinks = freelancerRows[0]?.links || [];
    const updatedLinks = existingLinks.filter((l) => l !== linkToDelete);

    await db.query(`UPDATE fm_freelancers SET links = $1 WHERE clerk_id = $2`, [
      JSON.stringify(updatedLinks),
      id,
    ]);

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  return (
    <>
      <div className="user-profile-container">
        <h1 className="profile-title">Profile</h1>
        <div className="user-details">
          <div className="profile-skills-form-contents">
            <EditableUsername
              username={username}
              action={handleUsernameChange}
            />
            <p className="profile-role">Role: {userDetails[0].role}</p>
            <Editablebio bio={bio} action={handleBioChange} />
            <EditableHourlyRate
              hourly_rate={hourly_rate}
              action={handleHourlyRateChange}
            />

            <ul className="profile-skills" key={id}>
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
                  <div className="skill-add-conatiner" key={skill}>
                    <label className="checkbox-label">
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
          <div className="profile-skills-form-contents">
            <h2 className="profile-username">Links</h2>

            <ul className="profile-links">
              {freelancerDetails[0]?.links?.length > 0 ? (
                freelancerDetails[0].links.map((link, index) => (
                  <li key={index} className="profile-link-item">
                    <a href={link} target="_blank">
                      {link}
                    </a>
                    <form
                      action={handleDeleteLink}
                      style={{ display: "inline-block", marginLeft: "8px" }}
                    >
                      <input type="hidden" name="link" value={link} />
                      <button type="submit" className="delete-link-btn">
                        🗑️
                      </button>
                    </form>
                  </li>
                ))
              ) : (
                <li>No links added yet.</li>
              )}
            </ul>

            <form action={handleAddLink} className="add-link-form">
              <input
                type="url"
                name="link"
                placeholder="Add a link (https://example.com)"
                required
                className="link-input"
              />
              <button type="submit" className="submit-btn">
                Add Link
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
