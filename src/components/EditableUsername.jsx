"use client";

import { useState } from "react";

export default function EditableUsername({ username, action }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {!isEditing ? (
        <h2 className="profile-username">
          Username: {username}{" "}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setIsEditing(true)}
          >
            ✏️
          </span>
        </h2>
      ) : (
        <form action={action}>
          <input type="text" name="name" defaultValue={username} required />
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}
