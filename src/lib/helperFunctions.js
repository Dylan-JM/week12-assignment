import { auth } from "@clerk/nextjs/server";

export const canUseAI = async () => {
  const { userId, has } = await auth();
  if (has({ feature: "ai_helper" })) {
    return true;
  }
  return false;
};
