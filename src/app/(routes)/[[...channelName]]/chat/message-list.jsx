import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const MessageList = ({ messages }) => {
  const createLi = (message) => {
    const avatarUrl = message.data?.avatarUrl;
    const senderId = message.data?.senderId;
    const fallback = senderId ? senderId.slice(-1).toUpperCase() : "?";
    return (
      <li
        key={message.id}
        className="bg-slate-50 group my-2 flex justify-between p-3"
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
      </li>
    );
  };

  return <ul>{messages.map(createLi)}</ul>;
};
export default MessageList;
