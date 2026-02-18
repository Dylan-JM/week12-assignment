import AIChat from "@/components/AIChat";
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
    <>
      <h1>Please Upgrade your plan to the pro plan to use this feature</h1>
    </>
  );
}
