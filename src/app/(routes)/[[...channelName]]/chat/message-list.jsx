import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const MessageList = ({ messages, currentUserId, onRefetchMessages }) => {
  const [acceptingId, setAcceptingId] = useState(null);
  const [denyingId, setDenyingId] = useState(null);

  const acceptedJobIds = new Set(
    messages
      .filter((m) => m.data?.messageType === "proposal_accepted" && m.data?.acceptedJobId)
      .map((m) => m.data.acceptedJobId)
  );
  const deniedJobIds = new Set(
    messages
      .filter((m) => m.data?.messageType === "proposal_denied" && m.data?.deniedJobId)
      .map((m) => m.data.deniedJobId)
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
    const isProposal = Boolean(message.data?.proposalJobId);
    const isProposalAccepted = message.data?.messageType === "proposal_accepted";
    const isProposalDenied = message.data?.messageType === "proposal_denied";
    const isForCurrentUser = currentUserId && senderId && senderId !== currentUserId;
    const isAccepting = acceptingId === message.data?.proposalJobId;
    const isDenying = denyingId === message.data?.proposalJobId;
    const alreadyAccepted = isProposal && acceptedJobIds.has(message.data?.proposalJobId);
    const alreadyDenied = isProposal && deniedJobIds.has(message.data?.proposalJobId);

    if (isProposalAccepted) {
      const jobTitle = message.data?.jobTitle;
      const startDate = message.data?.startDate;
      const endDate = message.data?.endDate;
      return (
        <li key={message.id} className="my-2">
          <div className="rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                ✓
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-green-800">Proposal accepted</p>
                {jobTitle && <p className="mt-1 text-sm font-medium text-green-800">{jobTitle}</p>}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-sm text-green-700">
                  {startDate && <span>Start: {new Date(startDate).toLocaleDateString()}</span>}
                  {endDate && <span>End: {new Date(endDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </div>
        </li>
      );
    }

    if (isProposalDenied) {
      return (
        <li key={message.id} className="my-2">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                ✕
              </span>
              <p className="font-semibold text-red-800">Proposal denied</p>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li
        key={message.id}
        className="bg-slate-50 group my-2 flex flex-col gap-2 p-3"
      >
        <div className="flex items-center">
          <Avatar className="mr-2">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <p>{message.data?.text}</p>
        </div>
        {isProposal && isForCurrentUser && !alreadyAccepted && !alreadyDenied && (
          <div className="ml-10 flex gap-2">
            <button
              type="button"
              onClick={() => handleAcceptProposal(message.data.proposalJobId, message.data.senderId)}
              disabled={isAccepting}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isAccepting ? "Accepting…" : "Accept proposal"}
            </button>
            <button
              type="button"
              onClick={() => handleDenyProposal(message.data.proposalJobId)}
              disabled={isDenying}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDenying ? "Denying…" : "Deny proposal"}
            </button>
          </div>
        )}
      </li>
    );
  };

  return <ul>{messages.map(createLi)}</ul>;
};
export default MessageList;
