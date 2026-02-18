"use client";

import { useRouter, usePathname } from "next/navigation";

export default function JobSortDropdown({ currentSort }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams();
    if (value && value !== "latest") params.set("sort", value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="job-sort" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="job-sort"
        value={currentSort}
        onChange={handleChange}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[rgb(0,153,255)] focus:outline-none focus:ring-1 focus:ring-[rgb(0,153,255)]"
      >
        <option value="latest">Latest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
