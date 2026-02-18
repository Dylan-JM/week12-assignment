"use client";
import { useState } from "react";

export default function EditableReview({
  review,
  action,
  deleteAction,
  canEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="review-container">
      {!isEditing ? (
        <>
          <p>
            <strong>Rating:</strong> {review.rating} / 5⭐
          </p>
          <p>{review.content}</p>
          <p className="review-date">
            <em>{new Date(review.created_at).toLocaleDateString("en-GB")}</em>
          </p>

          {canEdit && (
            <div className="flex gap-2">
              <span
                style={{ cursor: "pointer" }}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit
              </span>

              <span
                style={{ cursor: "pointer", color: "red" }}
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this review?")) {
                    await deleteAction(review.id);
                  }
                }}
              >
                🗑 Delete
              </span>
            </div>
          )}
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            await action(formData);
            setIsEditing(false);
          }}
          className="flex flex-col gap-2"
        >
          <label>
            Rating:
            <input
              type="number"
              name="rating"
              defaultValue={review.rating}
              min="1"
              max="5"
              required
            />
            ⭐
          </label>

          <label>
            Review:
            <textarea
              name="content"
              rows={4}
              defaultValue={review.content}
              required
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="submit-btn">
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="submit-btn bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
