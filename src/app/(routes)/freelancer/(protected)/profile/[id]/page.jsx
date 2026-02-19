import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Coins, Gem } from "lucide-react";
import EditableUsername from "@/components/EditableUsername";
import Editablebio from "@/components/EditBio";
import EditableHourlyRate from "@/components/EditableHourlyRate";
import { getTierForClerkId, getProfileLimits } from "@/lib/helperFunctions";
import FreelancerSideBar from "@/components/FreelancerSideBar";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { rows: userRows } = await db.query(
    `SELECT role FROM fm_users WHERE clerk_id = $1`,
    [id],
  );
  const role = userRows[0]?.role;
  if (role === "freelancer") {
    const { rows: freelancerRows } = await db.query(
      `SELECT name, bio, hourly_rate FROM fm_freelancers WHERE clerk_id = $1`,
      [id],
    );
    const f = freelancerRows[0];
    const name = f?.name ?? "Freelancer";
    const bio = f?.bio?.slice(0, 160) ?? "";
    const rate = f?.hourly_rate != null ? ` £${f.hourly_rate}/hr` : "";
    return {
      title: `${name} — Profile`,
      description: bio
        ? `${name}'s profile on TrueHire.${rate ? ` Hourly rate:${rate}` : ""} ${bio}`
        : `View and edit ${name}'s freelancer profile${rate ? ` and rate${rate}` : ""} on TrueHire.`,
    };
  }
  if (role === "client") {
    const { rows: clientRows } = await db.query(
      `SELECT name, bio FROM fm_clients WHERE clerk_id = $1`,
      [id],
    );
    const c = clientRows[0];
    const name = c?.name ?? "User";
    const bio = c?.bio?.slice(0, 160) ?? "";
    return {
      title: `${name} — Profile`,
      description: bio
        ? `${name} on TrueHire. ${bio}`
        : `View ${name}'s profile on TrueHire.`,
    };
  }
  return { title: "Profile" };
}

export default async function FreelancerProfilePage({ params }) {
  const { id } = await params;
  const { userId, has } = await auth();
  const profileTier =
    userId === id
      ? has({ plan: "pro" })
        ? "pro"
        : has({ plan: "advanced" }) || has({ feature: "25_proposals_month" })
          ? "advanced"
          : null
      : await getTierForClerkId(id);

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
    `SELECT * FROM fm_freelancers WHERE clerk_id = $1`,
    [id],
  );

  const freelancerUUID = freelancerDetails[0]?.id;

  const { rows: freelancerReviews } = await db.query(
    `
  SELECT 
    r.*,
    COALESCE(c.name, f.name) AS reviewer_name
  FROM fm_reviews r
  LEFT JOIN fm_clients c 
    ON r.client_id = c.id
  LEFT JOIN fm_freelancers f 
    ON r.client_id = f.id
  WHERE r.freelancer_id = $1
  `,
    [freelancerUUID],
  );

  let overallRating = null;

  if (freelancerReviews.length > 0) {
    const totalPoints = freelancerReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    overallRating = (totalPoints / freelancerReviews.length).toFixed(1);
  }

  console.log(freelancerReviews);

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

  const isOwner = userId === id;
  const limits = isOwner ? getProfileLimits(profileTier) : null;
  const currentSkillsCount = freelancerDetails[0]?.skills?.length ?? 0;
  const currentLinksCount = freelancerDetails[0]?.links?.length ?? 0;
  const skillsAtLimit =
    limits != null && currentSkillsCount >= limits.maxSkills;
  const linksAtLimit =
    limits != null &&
    limits.maxLinks > 0 &&
    currentLinksCount >= limits.maxLinks;
  const canAddLinks = limits != null && limits.maxLinks > 0;

  async function handleSubmit(formData) {
    "use server";
    const { userId, has } = await auth();
    if (userId !== id) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }
    const tier = has({ plan: "pro" })
      ? "pro"
      : has({ plan: "advanced" }) || has({ feature: "25_proposals_month" })
        ? "advanced"
        : null;
    const { maxSkills } = getProfileLimits(tier);

    const newSkills = formData.getAll("skills").filter(Boolean);

    const { rows: freelancerRows } = await db.query(
      `SELECT skills FROM fm_freelancers WHERE clerk_id = $1`,
      [id],
    );

    const existingSkills = freelancerRows[0]?.skills || [];
    const updatedSkills = Array.from(
      new Set([...existingSkills, ...newSkills]),
    ).slice(0, maxSkills);

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
    const { userId } = await auth();
    if (userId !== id) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }

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
    const { userId } = await auth();
    if (userId !== id) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }

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
    const { userId } = await auth();
    if (userId !== id) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }

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

    const { userId, has } = await auth();
    if (userId !== id) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }
    const tier = has({ plan: "pro" })
      ? "pro"
      : has({ plan: "advanced" }) || has({ feature: "25_proposals_month" })
        ? "advanced"
        : null;
    const { maxLinks } = getProfileLimits(tier);
    if (maxLinks === 0) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }

    const newLink = formData.get("link");

    if (!newLink) return;

    const { rows: freelancerRows } = await db.query(
      `SELECT links FROM fm_freelancers WHERE clerk_id = $1`,
      [id],
    );

    const existingLinks = freelancerRows[0]?.links || [];
    const updatedLinks = Array.from(new Set([...existingLinks, newLink])).slice(
      0,
      maxLinks,
    );

    await db.query(`UPDATE fm_freelancers SET links = $1 WHERE clerk_id = $2`, [
      JSON.stringify(updatedLinks),
      id,
    ]);

    revalidatePath(`/freelancer/profile/${id}`);
    redirect(`/freelancer/profile/${id}`);
  }

  async function handleDeleteLink(formData) {
    "use server";
    const { userId } = await auth();
    if (userId !== id) {
      revalidatePath(`/freelancer/profile/${id}`);
      redirect(`/freelancer/profile/${id}`);
      return;
    }

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
      <div className="sidebar-main-container">
        <FreelancerSideBar />
        <div className="flex w-full justify-center px-4 py-6">
          <div className="user-profile-container relative w-full max-w-6xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div
              className={`absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium shadow-sm ring-1 ring-black/5 ${
                profileTier === "pro"
                  ? "bg-violet-100 text-violet-800"
                  : profileTier === "advanced"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {profileTier === "pro" ? (
                <>
                  <Gem className="h-5 w-5" />
                  <span>Pro</span>
                </>
              ) : profileTier === "advanced" ? (
                <>
                  <Coins className="h-5 w-5" />
                  <span>Advanced</span>
                </>
              ) : (
                <span>Free</span>
              )}
            </div>
            <div className="user-details">
              <div className="profile-skills-form-contents">
                <EditableUsername
                  username={username}
                  action={handleUsernameChange}
                />
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
                        {isOwner && (
                          <form
                            action={async (formData) => {
                              "use server";
                              const { userId } = await auth();
                              if (userId !== id) {
                                revalidatePath(`/freelancer/profile/${id}`);
                                redirect(`/freelancer/profile/${id}`);
                                return;
                              }
                              const skillToDelete = formData.get("skill");

                              const { rows: freelancerRows } = await db.query(
                                `SELECT skills FROM fm_freelancers WHERE clerk_id = $1`,
                                [id],
                              );
                              const existingSkills =
                                freelancerRows[0]?.skills || [];
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
                            style={{
                              display: "inline-block",
                              marginLeft: "8px",
                            }}
                          >
                            <input type="hidden" name="skill" value={skill} />
                            <button type="submit" className="delete-skill-btn">
                              X
                            </button>
                          </form>
                        )}
                      </li>
                    ))
                  ) : (
                    <li>No skills added yet.</li>
                  )}
                </ul>
              </div>
              <form
                action={handleSubmit}
                className="profile-skills-form-contents"
              >
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
                            disabled={skillsAtLimit}
                          />
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {skillsAtLimit && (
                  <p className="text-sm text-amber-700 mt-1">
                    Maximum skills reached ({limits?.maxSkills ?? 3}). Upgrade
                    to Advanced for 10 skills or Pro for unlimited.
                  </p>
                )}
                <button
                  className="submit-btn"
                  type="submit"
                  disabled={skillsAtLimit}
                >
                  Add Skills
                </button>
              </form>
              <div className="profile-skills-form-contents">
                <h2 className="profile-username">Links</h2>

                <ul className="profile-links">
                  {freelancerDetails[0]?.links?.length > 0 ? (
                    freelancerDetails[0].links.map((link, index) => (
                      <li key={index} className="profile-link-item">
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {link}
                        </a>
                        {isOwner && (
                          <form
                            action={handleDeleteLink}
                            style={{
                              display: "inline-block",
                              marginLeft: "8px",
                            }}
                          >
                            <input type="hidden" name="link" value={link} />
                            <button type="submit" className="delete-link-btn">
                              🗑️
                            </button>
                          </form>
                        )}
                      </li>
                    ))
                  ) : (
                    <li>No links added yet.</li>
                  )}
                </ul>

                {!canAddLinks && isOwner && (
                  <p className="text-sm text-amber-700 mt-1">
                    Upgrade to Advanced to add up to 3 links, or Pro for 5
                    links.
                  </p>
                )}
                {canAddLinks && (
                  <>
                    {linksAtLimit && (
                      <p className="text-sm text-amber-700 mt-1">
                        Maximum links reached ({limits?.maxLinks}). Upgrade to
                        Pro for 5 links.
                      </p>
                    )}
                    <form action={handleAddLink} className="add-link-form">
                      <input
                        type="url"
                        name="link"
                        placeholder="Add a link (https://example.com)"
                        required
                        className="link-input"
                        disabled={linksAtLimit}
                      />
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={linksAtLimit}
                      >
                        Add Link
                      </button>
                    </form>
                  </>
                )}
              </div>
              <div className="profile-skills-form-contents">
                <h2 className="profile-username">Reviews</h2>
                <h2>Overall Rating:</h2>
                {overallRating ? (
                  <p>
                    {overallRating} / 5⭐ ({freelancerReviews.length} reviews)
                  </p>
                ) : (
                  <p>No rating yet.</p>
                )}
                <ul>
                  {freelancerReviews.map((review) => (
                    <li key={review.id} className="review-container">
                      <p>
                        <strong>Rating:</strong>{" "}
                        <span className="review-rating-inline">{review.rating} / 5⭐</span>
                      </p>
                      <p>
                        <strong>User:</strong>{" "}
                        {review.reviewer_name ?? "Unknown"}
                      </p>

                      <p>
                        <strong>Review:</strong> {review.content}
                      </p>

                      <p>
                        <small>
                          Created at:{" "}
                          {new Date(review.created_at).toLocaleString()}
                        </small>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
