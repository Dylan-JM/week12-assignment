"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function dmChannelSlug(idA, idB) {
  const [a, b] = [idA, idB].sort();
  return `dm-${a}-${b}`;
}

const ContactItem = ({ contact, currentUserId, basePath }) => {
  const slug = dmChannelSlug(currentUserId, contact.clerk_id);
  const path = `${basePath}/${slug}`;
  const pathname = usePathname();
  const isActive = pathname === path || pathname?.endsWith(slug);
  const label = contact.role === "client" ? "Client" : "Freelancer";
  const shortId = contact.clerk_id.replace("user_", "").slice(0, 8);

  return (
    <li>
      <Link
        href={path}
        className={clsx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-[rgb(0,153,255)]/15 font-semibold text-[rgb(0,153,255)]"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
          {label[0]}
        </span>
        <span className="truncate">{label} · {shortId}</span>
      </Link>
    </li>
  );
};

const ContactsList = ({ contacts, currentUserId, basePath = "/chat" }) => {
  if (!contacts?.length) {
    return (
      <p className="text-sm text-gray-500">
        No contacts yet. Other users will appear here when they sign up.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {contacts.map((contact) => (
        <ContactItem
          key={contact.clerk_id}
          contact={contact}
          currentUserId={currentUserId}
          basePath={basePath}
        />
      ))}
    </ul>
  );
};

export default ContactsList;
