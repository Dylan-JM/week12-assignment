import Link from "next/link";

export default function clientDashboardPage() {
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
      desc: "Manage your messages!",
      href: "/",
    },
    {
      title: "Freelancers",
      desc: "Browse all freelancers & find the perfect fit for your job!",
      href: "/freelancer",
    },
    {
      title: "Profile",
      desc: "View/Edit your profile & skills!",
      href: "/freelancer/profile",
    },
  ];

  return (
    <>
      <h1 className="tracker-title">Freelancer Portal</h1>
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
