import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/dbConnection";

export default async function SetupPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  async function saveRole(formData) {
    "use server";

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const role = formData.get("role");
    if (role !== "client" && role !== "freelancer") {
      throw new Error("Please select a role");
    }

    await db.query(
      `INSERT INTO fm_users (clerk_id, role)
       VALUES ($1, $2)
       ON CONFLICT (clerk_id) DO UPDATE SET role = EXCLUDED.role`,
      [userId, role]
    );

    redirect("/");
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <h1 className="homepage-title mb-2">Set up your profile</h1>
      <p className="homepage-message mb-10 max-w-md text-center">
        Choose your role to get started.
      </p>
      <form action={saveRole} className="flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            name="role"
            id="role"
            required
            className="min-w-[200px] rounded border border-gray-300 px-4 py-2 text-base"
          >
            <option value="">Select a role</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-[rgb(0,153,255)] px-6 py-2 font-semibold text-white hover:opacity-90"
        >
          Save
        </button>
      </form>
    </main>
  );
}
