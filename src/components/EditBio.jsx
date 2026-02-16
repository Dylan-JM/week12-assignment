"use client";

import { useState } from "react";

export default function Editablebio({ bio, action }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {!isEditing ? (
        <h2 className="profile-bio">
          bio: {bio}{" "}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setIsEditing(true)}
          >
            ✏️
          </span>
        </h2>
      ) : (
        <form action={action}>
          <input type="text" name="bio" defaultValue={bio} required />
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}
