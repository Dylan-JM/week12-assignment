import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function FreelancerSideBar() {
  const { userId } = await auth();
  const features = [
    { title: "Active Jobs", href: "/freelancer/jobs" },
    { title: "Analytics", href: "/freelancer/analytics" },
    { title: "Inbox", href: "/chat" },
    { title: "Profile", href: `/freelancer/profile/${userId}` },
    { title: "Find Jobs", href: "/freelancer/findJobs" },
    { title: "AI Assistant", href: "/freelancer/aiassistant" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Trackers</h2>
      <ul className="sidebar-list">
        {features.map((feature) => (
          <li key={feature.title} className="sidebar-item">
            <Link href={feature.href} className="sidebar-link">
              {feature.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
