import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const MessageList = ({ messages, currentUserId, onRefetchMessages }) => {
  const [acceptingId, setAcceptingId] = useState(null);

  const handleAcceptProposal = async (jobId) => {
    if (!jobId || !onRefetchMessages) return;
    setAcceptingId(jobId);
    try {
      const res = await fetch("/api/chat/accept-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) onRefetchMessages();
    } finally {
      setAcceptingId(null);
    }
  };

  const createLi = (message) => {
    const avatarUrl = message.data?.avatarUrl;
    const senderId = message.data?.senderId;
    const fallback = senderId ? senderId.slice(-1).toUpperCase() : "?";
    const isProposal = Boolean(message.data?.proposalJobId);
    const isProposalAccepted = message.data?.messageType === "proposal_accepted";
    const isForCurrentUser = currentUserId && senderId && senderId !== currentUserId;
    const isAccepting = acceptingId === message.data?.proposalJobId;

    if (isProposalAccepted) {
      return (
        <li key={message.id} className="my-2">
          <div className="rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                ✓
              </span>
              <div>
                <p className="font-semibold text-green-800">Proposal accepted</p>
                <p className="text-sm text-green-700">Contract created with start and end dates set.</p>
              </div>
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
        {isProposal && isForCurrentUser && (
          <div className="ml-10">
            <button
              type="button"
              onClick={() => handleAcceptProposal(message.data.proposalJobId)}
              disabled={isAccepting}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isAccepting ? "Accepting…" : "Accept proposal"}
            </button>
          </div>
        )}
      </li>
    );
  };

  return <ul>{messages.map(createLi)}</ul>;
};
export default MessageList;
