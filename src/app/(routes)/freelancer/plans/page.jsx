import { PricingTable } from "@clerk/nextjs";
import TextAnimation from "@/components/EnterAnimation";
export const metadata = {
  title: "Plans & Pricing",
  description:
    "Choose your TrueHire plan: Free, Advanced, or Pro. Unlock more proposals and profile features.",
};

export default function PricingPage() {
  return (
    <>
      <TextAnimation>
        <div className="plans-contents">
          <img
            src="https://thumbs.dreamstime.com/b/subscription-sticker-sign-transparent-background-rectangular-button-360704912.jpg"
            className="plans-img"
            alt="subscription-plans-image"
          />
          <PricingTable />
        </div>
      </TextAnimation>
    </>
  );
}
