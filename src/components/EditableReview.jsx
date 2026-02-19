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
            <strong>Rating:</strong>{" "}
            <span className="review-rating-inline">{review.rating} / 5⭐</span>
          </p>
          <p>
            <strong>User:</strong> {review.client_name}
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
          className="review-edit-form"
        >
          <div className="review-form-group">
            <label htmlFor="editable-review-rating">Rating (1 - 5) ⭐</label>
            <input
              id="editable-review-rating"
              className="review-form-input review-form-rating"
              type="number"
              name="rating"
              defaultValue={review.rating}
              min="1"
              max="5"
              required
            />
          </div>
          <div className="review-form-group">
            <label htmlFor="editable-review-content">Review</label>
            <textarea
              id="editable-review-content"
              className="review-form-textarea"
              name="content"
              rows={5}
              defaultValue={review.content}
              required
            />
          </div>
          <div className="review-form-actions">
            <button type="submit" className="submit-btn review-form-submit">
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="submit-btn review-form-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
