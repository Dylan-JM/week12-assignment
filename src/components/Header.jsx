import HeaderClient from "./HeaderClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

export default async function HeaderServer() {
  const { userId } = await auth();
  let role = null;
  if (userId) {
    const { rows } = await db.query(
      "SELECT role FROM fm_users WHERE clerk_id = $1",
      [userId],
    );
    role = rows[0]?.role ?? null;
  }

  return <HeaderClient role={role} />;
}
