import { PricingTable } from "@clerk/nextjs";

export const metadata = {
  title: "Plans & Pricing",
  description: "Choose your TrueHire plan: Free, Advanced, or Pro. Unlock more proposals and profile features.",
};

export default function PricingPage() {
  return (
    <>
      <div className="plans-contents">
        <img
          src="https://thumbs.dreamstime.com/b/subscription-sticker-sign-transparent-background-rectangular-button-360704912.jpg"
          className="plans-img"
        />
        <PricingTable />
      </div>
    </>
  );
}
