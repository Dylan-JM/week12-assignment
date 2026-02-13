import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

export const GET = async () => {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: me } = await db.query(
    "SELECT clerk_id, role FROM fm_users WHERE clerk_id = $1",
    [userId]
  );
  const current = me[0];
  if (!current) {
    return Response.json({ error: "User role not set" }, { status: 403 });
  }

  const oppositeRole = current.role === "client" ? "freelancer" : "client";
  const { rows: contacts } = await db.query(
    "SELECT clerk_id, role FROM fm_users WHERE role = $1 AND clerk_id != $2",
    [oppositeRole, userId]
  );

  return Response.json({
    role: current.role,
    contacts: contacts.map((r) => ({ clerk_id: r.clerk_id, role: r.role })),
  });
};
