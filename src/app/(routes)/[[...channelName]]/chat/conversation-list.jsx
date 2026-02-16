"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function dmSlug(idA, idB) {
  return "dm-" + [idA, idB].sort().join("-");
}

function ConversationItem({ conversation, currentUserId, basePath }) {
  const path = `${basePath}/${conversation.channelSlug}`;
  const pathname = usePathname();
  const isActive = pathname === path || pathname?.endsWith(conversation.channelSlug);
  const name = conversation.otherParty?.name ?? "Unknown";
  const imageUrl = conversation.otherParty?.imageUrl;
  const last = conversation.lastMessage;
  const isFromMe = last?.senderId === currentUserId;
  const senderLabel = last ? (isFromMe ? "You" : name) : null;
  const contentSnippet = last?.content
    ? last.content.slice(0, 36) + (last.content.length > 36 ? "…" : "")
    : "";
  const preview = senderLabel ? `${senderLabel}: ${contentSnippet}` : "No messages yet";

  return (
    <Link
      href={path}
      className={clsx(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-[rgb(0,153,255)]/15 font-semibold text-[rgb(0,153,255)]"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
          {name[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <span className="block truncate font-medium">{name}</span>
        <span className={clsx("block truncate text-xs", isActive ? "text-[rgb(0,153,255)]/80" : "text-gray-500")}>
          {preview}
        </span>
      </div>
    </Link>
  );
}

function ContactItem({ contact, currentUserId, basePath }) {
  const channelSlug = dmSlug(currentUserId, contact.clerkId);
  const path = `${basePath}/${channelSlug}`;
  const pathname = usePathname();
  const isActive = pathname === path || pathname?.endsWith(channelSlug);
  const name = contact.name ?? contact.clerkId?.slice(0, 12) ?? "—";
  const imageUrl = contact.imageUrl;

  return (
    <Link
      href={path}
      className={clsx(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-[rgb(0,153,255)]/15 font-semibold text-[rgb(0,153,255)]"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="bg-gray-200 text-xs text-gray-600">
          {name[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{name}</span>
    </Link>
  );
}

export default function ConversationList({
  conversations = [],
  contacts = [],
  currentUserId,
  role,
  basePath = "/chat",
}) {
  const contactLabel = role === "freelancer" ? "Clients" : "Freelancers";
  return (
    <div className="space-y-4">
      {contacts.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {contactLabel}
          </h3>
          <p className="mb-1.5 text-xs text-gray-400">
            Click anyone to start or continue a conversation
          </p>
          <ul className="space-y-0.5">
            {contacts.map((contact) => (
              <li key={contact.clerkId}>
                <ContactItem
                  contact={contact}
                  currentUserId={currentUserId}
                  basePath={basePath}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {conversations.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Recent conversations
          </h3>
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <ConversationItem
                  conversation={c}
                  currentUserId={currentUserId}
                  basePath={basePath}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {contacts.length === 0 && (
        <p className="text-sm text-gray-500">
          No one to message yet. Other users will appear here once they sign up and choose a role.
        </p>
      )}
    </div>
  );
}
