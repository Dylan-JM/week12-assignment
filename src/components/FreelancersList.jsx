"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const skillOptions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "PostgreSQL",
  "MongoDB",
  "Tailwind CSS",
  "Figma",
  "SEO",
  "Content Writing",
];

export default function FreelancersList({ freelancers }) {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [messageLoadingId, setMessageLoadingId] = useState(null);

  async function handleMessage(freelancer) {
    if (!freelancer.clerk_id || !user) return;
    setMessageLoadingId(freelancer.id);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherClerkId: freelancer.clerk_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start conversation");
      if (data.channelSlug) {
        router.push(`/chat?channel=${encodeURIComponent(data.channelSlug)}`);
      }
    } catch (err) {
      console.error(err);
      setMessageLoadingId(null);
    }
  }

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((freelancer) => {
      const matchesName = freelancer.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSkill = selectedSkill
        ? freelancer.skills.includes(selectedSkill)
        : true;

      return matchesName && matchesSkill;
    });
  }, [freelancers, search, selectedSkill]);

  return (
    <div>
      <div className="freelancer-filter-container">
        <h1 className="freelancer-filter-title">
          <strong>Filters</strong>
        </h1>
        <input
          className="find-freelancer-input"
          type="text"
          placeholder="Search by username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="find-freelancer-select"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
        >
          <option value="">All Skills</option>
          {skillOptions.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="all-client-jobs-container">
        {filteredFreelancers.map((freelancer) => (
          <div className="client-job-container" key={freelancer.id}>
            <h1 className="job-title">Username : {freelancer.name}</h1>

            <p className="profile-bio">Bio : {freelancer.bio}</p>

            <h2>
              <strong>Skills:</strong>
            </h2>
            <ul>
              {freelancer.skills.map((skill, index) => (
                <li className="job-skill" key={index}>
                  {skill}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleMessage(freelancer)}
              disabled={!user || !freelancer.clerk_id || messageLoadingId === freelancer.id}
              className="find-freelancer-message-btn"
            >
              {messageLoadingId === freelancer.id ? "Opening…" : "Message"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
