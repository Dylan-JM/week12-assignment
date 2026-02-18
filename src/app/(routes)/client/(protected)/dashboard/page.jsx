import Link from "next/link";

export const metadata = {
  title: "Client Dashboard",
  description:
    "Manage your jobs, find freelancers, and view jobs in progress on TrueHire.",
};

export default function clientDashboardPage() {
  const features = [
    {
      title: "Personal Jobs",
      desc: "A place to view all your jobs!",
      href: "/client/jobs",
    },
    {
      title: "Create New Job",
      desc: "Post a job for freelancers to find!",
      href: "/client/jobs/new",
    },
    {
      title: "Inbox",
      desc: "Message freelancers!",
      href: "/chat",
    },
    {
      title: "Freelancers",
      desc: "Browse all freelancers & find the perfect fit for your job!",
      href: "/client/findFreelancers",
    },
    {
      title: "Jobs In Progress",
      desc: "View all your current ongoing Jobs!",
      href: "/client/jobs/inprogress",
    },
    {
      title: "See All Jobs",
      desc: "Find other clients jobs & see what's going on!",
      href: "/client/findJobs",
    },
  ];

  return (
    <>
      <h1 className="tracker-title">Client Portal</h1>
      <div className="main-features-container">
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
      </div>
    </>
  );
}
