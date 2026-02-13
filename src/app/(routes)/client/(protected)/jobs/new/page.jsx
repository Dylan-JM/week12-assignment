import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default function NewClientJobPage() {
  const jobCategories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "SEO",
    "Data Analysis",
  ];

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

  async function handleSubmit(formData) {
    "use server";

    const { userId } = await auth();

    const { rows: client_id } = await db.query(
      `SELECT id FROM fm_clients WHERE clerk_id = $1`,
      [userId],
    );

    const rawClientId = client_id[0].id;

    const title = formData.get("title");
    const description = formData.get("description");
    const budget = Number(formData.get("budget"));
    const deadlineRaw = formData.get("deadline");
    const deadline = new Date(deadlineRaw);
    const category = formData.get("category");
    const skills_required = formData.getAll("skills_required");

    if (!title || !budget || !deadline) {
      throw new Error("Missing required fields");
    }

    await db.query(
      `INSERT INTO fm_jobs 
   (client_id, title, description, budget, deadline, category, skills_required)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        rawClientId,
        title,
        description,
        budget,
        deadline,
        category,
        JSON.stringify(skills_required),
      ],
    );

    revalidatePath("/client/jobs");

    redirect("/client/jobs");
  }
  return (
    <>
      <div className="client-job-form-container">
        <div className="client-job-border-card">
          <h1 className="client-job-title">Add A Job</h1>
          <form action={handleSubmit} className="client-job-form-contents">
            <div className="client-job-form-group">
              <label htmlFor="title">Job Title:</label>
              <input type="text" name="title" id="title" required />
            </div>

            <div className="client-job-form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                type="text"
                name="description"
                id="description"
                rows={4}
                required
              />
            </div>

            <div className="client-job-form-group">
              <label htmlFor="budget">Budget:</label>
              <input type="number" name="budget" id="budget" required />
            </div>

            <div className="client-job-form-group">
              <label htmlFor="deadline">Deadline:</label>
              <input type="date" name="deadline" required />
            </div>

            <div className="client-job-form-group">
              <label htmlFor="category">Category :</label>
              <select name="category" id="category" required>
                <option value="">Select a category</option>
                {jobCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="client-job-form-group">
              <div className="skills-grid">
                {skillOptions.map((skill) => (
                  <label key={skill} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="skills_required"
                      value={skill}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <button className="submit-btn" type="submit">
              Add Job
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
