import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import EditableReview from "@/components/EditableReview";

export default async function ViewFreelancerPage({ params }) {
  const { id } = await params;

  const { rows: freelancerDetails } = await db.query(
    `SELECT * FROM fm_freelancers
      WHERE id = $1`,
    [id],
  );

  const { rows: userDetails } = await db.query(
    `SELECT * FROM fm_users
      WHERE clerk_id = $1`,
    [freelancerDetails[0].clerk_id],
  );

  const { rows: freelancerReviews } = await db.query(
    `SELECT * FROM fm_reviews
      WHERE freelancer_id = $1`,
    [id],
  );

  const { userId } = await auth();

  const { rows: client_id } = await db.query(
    `SELECT id FROM fm_clients WHERE clerk_id = $1`,
    [userId],
  );

  console.log(freelancerReviews);

  const rawClientId = client_id[0].id;

  async function addReview(formData) {
    "use server";

    const { userId } = await auth();

    const { rows: client_id } = await db.query(
      `SELECT id FROM fm_clients WHERE clerk_id = $1`,
      [userId],
    );

    const rawClientId = client_id[0]?.id;

    const content = formData.get("content");
    const rating = formData.get("rating");

    await db.query(
      `INSERT INTO fm_reviews
     (freelancer_id, client_id, content, rating)
     VALUES ($1, $2, $3, $4)`,
      [id, rawClientId, content, rating],
    );

    revalidatePath(`/client/findFreelancers/${id}`);

    redirect(`/client/findFreelancers/${id}`);
  }

  let overallRating = null;

  if (freelancerReviews.length > 0) {
    const totalPoints = freelancerReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    overallRating = (totalPoints / freelancerReviews.length).toFixed(1);
  }

  async function deleteReview(reviewId) {
    await db.query(`DELETE FROM fm_reviews WHERE id = $1`, [reviewId]);
    revalidatePath(`/client/findFreelancers/${id}`);
  }

  return (
    <>
      <div className="user-profile-container">
        <h1 className="profile-title">Profile</h1>
        <div className="user-details">
          <div className="profile-skills-form-contents">
            <p className="job-title">Username: {freelancerDetails[0].name}</p>
            <p className="profile-bio">Role: {userDetails[0].role}</p>
            <p className="profile-bio">Bio: {freelancerDetails[0].bio}</p>
            <p className="profile-bio">
              Hourly Rate: £{freelancerDetails[0].hourly_rate}
            </p>
            <h2>
              <strong>Skills:</strong>
            </h2>
            {freelancerDetails.map((freelancer) => (
              <ul key={freelancer.id}>
                {(freelancer.skills || []).map((skill, index) => (
                  <li className="job-skill" key={`${freelancer.id}-${index}`}>
                    {skill}
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="profile-skills-form-contents">
            <h2 className="profile-username">Links</h2>
            {freelancerDetails.map((freelancer) => (
              <ol key={freelancer.id}>
                {(freelancer.links || []).map((link, index) => (
                  <li key={`${freelancer.id}-link-${index}`}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ol>
            ))}
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

            {freelancerReviews.length > 0 ? (
              <ol>
                {freelancerReviews.map((review) => (
                  <EditableReview
                    key={review.id}
                    review={review}
                    canEdit={review.client_id === rawClientId}
                    action={async (formData) => {
                      "use server";
                      const rating = formData.get("rating");
                      const content = formData.get("content");

                      await db.query(
                        `UPDATE fm_reviews SET rating = $1, content = $2 WHERE id = $3`,
                        [rating, content, review.id],
                      );

                      revalidatePath(`/client/findFreelancers/${id}`);
                    }}
                    deleteAction={async (reviewId) => {
                      "use server";
                      await db.query(`DELETE FROM fm_reviews WHERE id = $1`, [
                        reviewId,
                      ]);
                      revalidatePath(`/client/findFreelancers/${id}`);
                    }}
                  />
                ))}
              </ol>
            ) : (
              <p>No reviews yet.</p>
            )}

            <form action={addReview} className="profile-skills-form-contents">
              <div>
                <h2 className="profile-username">Leave A Review!</h2>
                <label htmlFor="rating">Rating 1 - 5⭐:</label>
                <input
                  className="contact-us-input"
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  required
                />
              </div>
              <div>
                <label htmlFor="content">Review:</label>
                <textarea
                  className="contact-us-textarea"
                  id="content"
                  name="content"
                  rows={4}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
