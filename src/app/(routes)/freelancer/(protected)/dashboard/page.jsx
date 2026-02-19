import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import TextAnimation from "@/components/EnterAnimation";

export const metadata = {
  title: "Freelancer Dashboard",
  description:
    "Manage your active jobs, profile, analytics, and find new opportunities on TrueHire.",
};

export default async function clientDashboardPage() {
  const { userId } = await auth();

  const features = [
    {
      title: "Active Jobs",
      desc: "A place to view all your active jobs!",
      href: "/freelancer/jobs",
    },
    {
      title: "Analytics",
      desc: "Find reports & insights about your jobs!",
      href: "/freelancer/analytics",
    },
    {
      title: "Inbox",
      desc: "Message clients!",
      href: "/chat",
    },
    {
      title: "Profile",
      desc: "View/Edit your profile & add skills!",
      href: `/freelancer/profile/${userId}`,
    },
    {
      title: "Find Jobs",
      desc: "Find & Apply For Jobs",
      href: `/freelancer/findJobs`,
    },
    {
      title: "AI Assistant",
      desc: "Nedd Help With Your Jobs!",
      href: "/freelancer/aiassistant",
    },
  ];

  return (
    <>
      <h1 className="tracker-title">Freelancer Portal</h1>
      <div className="main-features-container">
        <TextAnimation>
          <section className="features-grid">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="feature-card"
              >
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </Link>
            ))}
          </section>
        </TextAnimation>
      </div>
    </>
  );
}
