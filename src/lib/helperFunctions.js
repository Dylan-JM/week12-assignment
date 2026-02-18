import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";

export const canUseAI = async () => {
  const { userId, has } = await auth();
  if (has({ feature: "ai_helper" })) {
    return true;
  }
  return false;
};

/** Returns "pro" | "advanced" | null for a given clerk user id (from Clerk API). */
export async function getTierForClerkId(clerkId) {
  if (!clerkId) return null;
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const user = await clerk.users.getUser(clerkId);
    const plan = user?.publicMetadata?.plan ?? user?.privateMetadata?.plan;
    if (plan === "pro") return "pro";
    if (plan === "advanced") return "advanced";
    return null;
  } catch {
    return null;
  }
}
