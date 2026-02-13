import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/dbConnection";

export default async function ClientProtectedLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { rows } = await db.query(
    "SELECT role FROM fm_users WHERE clerk_id = $1",
    [userId]
  );
  const user = rows[0];

  if (!user) redirect("/setup");
  if (user.role !== "client") redirect("/");

  return <>{children}</>;
}
