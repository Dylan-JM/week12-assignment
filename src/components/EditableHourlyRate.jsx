"use client";

import { useState } from "react";

export default function EditableHourlyRate({ hourly_rate, action }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {!isEditing ? (
        <h2 className="profile-bio">
          Hourly Rate: £{hourly_rate}{" "}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setIsEditing(true)}
          >
            ✏️
          </span>
        </h2>
      ) : (
        <form action={action}>
          <input
            type="text"
            name="hourly_rate"
            defaultValue={hourly_rate}
            required
          />
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}
