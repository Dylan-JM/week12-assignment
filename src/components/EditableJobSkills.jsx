"use client";

export default function EditableJobSkills({ skills, addAction, deleteAction }) {
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

  return (
    <div className="editable-job-skills">
      <h2>
        <strong>Skills Required:</strong>
      </h2>

      <ul>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <li key={index} className="job-skill">
              {skill}
              <form
                action={deleteAction}
                style={{ display: "inline-block", marginLeft: "8px" }}
              >
                <input type="hidden" name="skill" value={skill} />
                <button type="submit">X</button>
              </form>
            </li>
          ))
        ) : (
          <li>No skills added yet.</li>
        )}
      </ul>

      <form action={addAction} className="profile-skills-form-contents">
        <div className="client-job-form-group">
          <div className="profile-skills-container">
            {skillOptions.map((skill) => (
              <div className="skill-add-conatiner" key={skill}>
                <label
                  className="checkbox-label"
                  key={skill}
                  style={{ display: "block" }}
                >
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill}
                    className="profile-skill-input"
                  />
                  {skill}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button className="submit-btn">Add Skills</button>
      </form>
    </div>
  );
}
