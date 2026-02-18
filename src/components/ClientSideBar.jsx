import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function ClientSideBar() {
  const { userId } = await auth();
  const features = [
    { title: "Personal Jobs", href: "/client/jobs" },
    { title: "Create New Job", href: "/client/jobs/new" },
    { title: "Inbox", href: "/chat" },
    { title: "Freelancers", href: `/client/findFreelancers` },
    { title: "Jobs In Progress", href: "/client/jobs/inprogress" },
    { title: "See All Jobs", href: "/client/findJobs" },
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
