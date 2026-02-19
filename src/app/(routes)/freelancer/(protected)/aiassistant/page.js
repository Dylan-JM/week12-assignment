import AIChat from "@/components/AIChat";
import UpgradePlanCard from "@/components/UpgradePlanCard";
import { canUseAI } from "@/lib/helperFunctions";

export default async function ChatPage() {
  const checkUseAI = await canUseAI();

  if (checkUseAI) {
    return (
      <>
        <AIChat />
      </>
    );
  }
  return (
    <UpgradePlanCard
      title="Please upgrade your plan to the Pro plan to use this feature"
      description="AI Assistant is available on the Pro plan. Upgrade to get help with your freelancing questions and tasks."
    />
  );
}
