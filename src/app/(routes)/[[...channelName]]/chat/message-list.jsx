import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const MessageList = ({ messages, currentUserId }) => {
  const createLi = (message) => {
    const avatarUrl = message.data?.avatarUrl;
    const senderId = message.data?.senderId;
    const fallback = senderId ? senderId.slice(-1).toUpperCase() : "?";
    const isProposal = Boolean(message.data?.proposalJobId);
    const isForCurrentUser = currentUserId && senderId && senderId !== currentUserId;

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
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Accept proposal
            </button>
          </div>
        )}
      </li>
    );
  };

  return <ul>{messages.map(createLi)}</ul>;
};
export default MessageList;
