import Link from "next/link";

const defaultTitle =
  "Please upgrade your plan to the Pro plan to use this feature";
const defaultDescription =
  "This feature is available on the Pro plan. Upgrade to unlock it.";
const defaultHref = "/freelancer/plans";
const defaultButtonText = "Upgrade";

export default function UpgradePlanCard({
  title = defaultTitle,
  description = defaultDescription,
  href = defaultHref,
  buttonText = defaultButtonText,
}) {
  return (
    <div className="upgrade-plan-card-wrapper">
      <div className="upgrade-plan-card">
        <h1 className="upgrade-plan-title">{title}</h1>
        <p className="upgrade-plan-description">{description}</p>
        <Link href={href} className="upgrade-plan-btn">
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
