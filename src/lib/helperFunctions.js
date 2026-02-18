import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";

export const canUseAI = async () => {
  const { userId, has } = await auth();
  if (has({ feature: "ai_helper" })) {
    return true;
  }
  return false;
};

/** Returns "pro" | "advanced" | null for a given clerk user id. Uses Clerk Billing first (same source as has()), then metadata. */
export async function getTierForClerkId(clerkId) {
  if (!clerkId) return null;
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Same source as auth().has({ plan: "pro" }) — Clerk Billing subscription
    if (typeof clerk.billing?.getUserBillingSubscription === "function") {
      const sub = await clerk.billing.getUserBillingSubscription(clerkId);
      const item = sub?.subscriptionItems?.[0] ?? sub?.items?.[0];
      const planName = (item?.plan?.name ?? item?.plan?.slug ?? "").toLowerCase();
      if (planName === "pro") return "pro";
      if (planName === "advanced") return "advanced";
    }

    const user = await clerk.users.getUser(clerkId);
    const plan = user?.publicMetadata?.plan ?? user?.privateMetadata?.plan;
    if (plan === "pro") return "pro";
    if (plan === "advanced") return "advanced";
    return null;
  } catch {
    return null;
  }
}
