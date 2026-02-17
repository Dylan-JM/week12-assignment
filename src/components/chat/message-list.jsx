import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import styles from "./message-list.module.css";

function formatMessageTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

const MessageList = ({ messages, currentUserId, onRefetchMessages }) => {
  const [acceptingId, setAcceptingId] = useState(null);
  const [denyingId, setDenyingId] = useState(null);

  const acceptedJobIds = new Set(
    messages
      .filter(
        (m) =>
          m.data?.messageType === "proposal_accepted" && m.data?.acceptedJobId,
      )
      .map((m) => m.data.acceptedJobId),
  );
  const deniedJobIds = new Set(
    messages
      .filter(
        (m) => m.data?.messageType === "proposal_denied" && m.data?.deniedJobId,
      )
      .map((m) => m.data.deniedJobId),
  );

  const handleAcceptProposal = async (jobId, freelancerClerkId) => {
    if (!jobId || !onRefetchMessages) return;
    setAcceptingId(jobId);
    try {
      const res = await fetch("/api/chat/accept-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, freelancerClerkId }),
      });
      if (res.ok) onRefetchMessages();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDenyProposal = async (jobId) => {
    if (!jobId || !onRefetchMessages) return;
    setDenyingId(jobId);
    try {
      const res = await fetch("/api/chat/deny-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) onRefetchMessages();
    } finally {
      setDenyingId(null);
    }
  };

  const createLi = (message) => {
    const avatarUrl = message.data?.avatarUrl;
    const senderId = message.data?.senderId;
    const fallback = senderId ? senderId.slice(-1).toUpperCase() : "?";
    const isMe = currentUserId && senderId && senderId === currentUserId;
    const isProposal = Boolean(message.data?.proposalJobId);
    const isProposalAccepted =
      message.data?.messageType === "proposal_accepted";
    const isProposalDenied = message.data?.messageType === "proposal_denied";
    const isFile = message.data?.messageType === "file" && message.data?.fileUrl;
    const isForCurrentUser =
      currentUserId && senderId && senderId !== currentUserId;
    const isAccepting = acceptingId === message.data?.proposalJobId;
    const isDenying = denyingId === message.data?.proposalJobId;
    const alreadyAccepted =
      isProposal && acceptedJobIds.has(message.data?.proposalJobId);
    const alreadyDenied =
      isProposal && deniedJobIds.has(message.data?.proposalJobId);

    if (isProposalAccepted) {
      const jobTitle = message.data?.jobTitle;
      const startDate = message.data?.startDate;
      const endDate = message.data?.endDate;
      return (
        <li key={message.id} className="flex w-full justify-center">
          <div className="max-w-[85%] rounded-lg border-2 border-(--chat-system-success-border) bg-(--chat-system-success-bg) px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--chat-system-success-icon-bg) text-white">
                ✓
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-(--chat-system-success-text)">
                  Proposal accepted
                </p>
                {jobTitle && (
                  <p className="mt-1 text-sm font-medium text-(--chat-system-success-text)">
                    {jobTitle}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-sm text-(--chat-system-success-muted)">
                  {startDate && (
                    <span>
                      Start: {new Date(startDate).toLocaleDateString()}
                    </span>
                  )}
                  {endDate && (
                    <span>End: {new Date(endDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </li>
      );
    }

    if (isProposalDenied) {
      return (
        <li key={message.id} className="flex w-full justify-center">
          <div className="max-w-[85%] rounded-lg border-2 border-(--chat-system-denied-border) bg-(--chat-system-denied-bg) px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--chat-system-denied-icon-bg) text-white">
                ✕
              </span>
              <p className="font-semibold text-(--chat-system-denied-text)">
                Proposal denied
              </p>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li
        key={message.id}
        className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex min-w-0 items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div
            className={`flex min-w-0 max-w-(--chat-bubble-max-width) flex-col gap-2 ${isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`min-w-0 max-w-full px-3 py-2 text-sm whitespace-pre-wrap wrap-break-word rounded-2xl border ${
                isMe
                  ? "rounded-bl-sm bg-(--chat-bubble-me-bg) border-(--chat-bubble-me-border) text-(--chat-bubble-me-text)"
                  : "rounded-br-sm bg-(--chat-bubble-other-bg) border-(--chat-bubble-other-border) text-(--chat-bubble-other-text)"
              }`}
            >
              {isFile ? (
                <a
                  href={message.data.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80"
                >
                  {message.data.fileName || "View PDF"}
                </a>
              ) : (
                message.data?.text
              )}
              {(message.timestamp ?? message.data?.createdAt) && (
                <span className="mt-1 block text-xs opacity-75">
                  {formatMessageTime(message.timestamp ?? message.data?.createdAt)}
                </span>
              )}
            </div>
            {isProposal &&
              isForCurrentUser &&
              !alreadyAccepted &&
              !alreadyDenied && (
                <div
                  className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleAcceptProposal(
                        message.data.proposalJobId,
                        message.data.senderId,
                      )
                    }
                    disabled={isAccepting}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {isAccepting ? "Accepting…" : "Accept proposal"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDenyProposal(message.data.proposalJobId)
                    }
                    disabled={isDenying}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDenying ? "Denying…" : "Deny proposal"}
                  </button>
                </div>
              )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <ul className={`${styles.root} flex flex-col gap-2 list-none p-0 m-0`}>
      {messages.map(createLi)}
    </ul>
  );
};
export default MessageList;
