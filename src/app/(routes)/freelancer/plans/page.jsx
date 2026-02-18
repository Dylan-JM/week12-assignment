import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <>
      <div className="plans-contents">
        <PricingTable />
      </div>
    </>
  );
}
