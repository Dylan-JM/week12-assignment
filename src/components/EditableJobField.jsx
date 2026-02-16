"use client";

import { useState } from "react";

export default function EditableJobField({
  label,
  field,
  value,
  action,
  textarea = false,
  type = "text",
  selectOptions = null,
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="editable-job-field">
      {!isEditing ? (
        <div>
          <strong>{label}:</strong> {value || "—"}{" "}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setIsEditing(true)}
          >
            ✏️
          </span>
        </div>
      ) : (
        <form action={action}>
          <input type="hidden" name="field" value={field} />

          {textarea && <textarea name="value" defaultValue={value} required />}

          {selectOptions && (
            <select name="value" defaultValue={value} required>
              {selectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {!textarea && !selectOptions && (
            <input type={type} name="value" defaultValue={value} required />
          )}

          <button type="submit" className="submit-btn">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
