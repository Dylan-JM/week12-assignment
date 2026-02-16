import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import EditableJobField from "@/components/EditableJobField";
import EditableJobSkills from "@/components/EditableJobSkills";

export default async function SpecificJobPage({ params }) {
  const { userId } = await auth();
  const { id } = await params;

  const { rows: jobDetails } = await db.query(
    `SELECT * FROM fm_jobs WHERE id = $1`,
    [id],
  );

  if (!jobDetails.length) {
    return <h1>Job not found</h1>;
  }

  const job = jobDetails[0];

  async function updateField(formData) {
    "use server";

    const field = formData.get("field");
    const value = formData.get("value");

    await db.query(`UPDATE fm_jobs SET ${field} = $1 WHERE id = $2`, [
      value,
      id,
    ]);

    revalidatePath(`/client/jobs/${id}`);
    redirect(`/client/jobs/${id}`);
  }

  async function addSkills(formData) {
    "use server";

    const newSkills = formData.getAll("skills");

    const { rows } = await db.query(
      `SELECT skills_required FROM fm_jobs WHERE id = $1`,
      [id],
    );

    const existing = rows[0]?.skills_required || [];

    const updated = Array.from(new Set([...existing, ...newSkills]));

    await db.query(`UPDATE fm_jobs SET skills_required = $1 WHERE id = $2`, [
      JSON.stringify(updated),
      id,
    ]);

    revalidatePath(`/client/jobs/${id}`);
    redirect(`/client/jobs/${id}`);
  }

  async function deleteSkill(formData) {
    "use server";

    const skillToDelete = formData.get("skill");

    const { rows } = await db.query(
      `SELECT skills_required FROM fm_jobs WHERE id = $1`,
      [id],
    );

    const existing = rows[0]?.skills_required || [];

    const updated = existing.filter((s) => s !== skillToDelete);

    await db.query(`UPDATE fm_jobs SET skills_required = $1 WHERE id = $2`, [
      JSON.stringify(updated),
      id,
    ]);

    revalidatePath(`/client/jobs/${id}`);
    redirect(`/client/jobs/${id}`);
  }

  async function deleteJob() {
    "use server";

    await db.query(`DELETE FROM fm_jobs WHERE id = $1`, [id]);

    revalidatePath(`/client/jobs`);
    redirect(`/client/jobs`);
  }

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

  return (
    <div className="all-client-jobs-container">
      <div className="client-job-container">
        <EditableJobField
          label="Title"
          field="title"
          value={job.title}
          action={updateField}
        />

        <EditableJobField
          label="Description"
          field="description"
          value={job.description}
          action={updateField}
          textarea
        />

        <EditableJobField
          label="Budget"
          field="budget"
          value={job.budget}
          action={updateField}
          type="number"
        />

        <EditableJobField
          label="Deadline"
          field="deadline"
          value={
            job.deadline
              ? new Date(job.deadline).toISOString().split("T")[0]
              : ""
          }
          action={updateField}
          type="date"
        />

        <EditableJobField
          label="Category"
          field="category"
          value={job.category}
          action={updateField}
          selectOptions={jobCategories}
        />
        <form action={deleteJob}>
          <button type="submit" className="delete-btn">
            Delete Job
          </button>
        </form>

        <EditableJobSkills
          skills={job.skills_required || []}
          addAction={addSkills}
          deleteAction={deleteSkill}
        />
      </div>
    </div>
  );
}
