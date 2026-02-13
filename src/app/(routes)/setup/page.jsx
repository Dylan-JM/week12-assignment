import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/dbConnection";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  async function saveRole(formData) {
    "use server";

    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const role = formData.get("role");
    if (role !== "client" && role !== "freelancer") {
      return { error: "Please select a role" };
    }

    await db.query(
      `INSERT INTO fm_users (clerk_id, role)
       VALUES ($1, $2)
       ON CONFLICT (clerk_id) DO UPDATE SET role = EXCLUDED.role`,
      [userId, role]
    );

    return { success: true, role };
  }

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <h1 className="homepage-title mb-2">Set up your profile</h1>
      <p className="homepage-message mb-10 max-w-md text-center">
        Choose your role to get started.
      </p>
      <SetupForm saveRole={saveRole} />
    </main>
  );
}
