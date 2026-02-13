import { Avatar, AvatarImage } from "@/components/ui/avatar";

const MessageList = ({ messages }) => {
  const createLi = (message) => (
    <li
      key={message.id}
      className="bg-slate-50 group my-2 flex justify-between p-3"
    >
      <div className="flex items-center">
        <Avatar className="mr-2">
          <AvatarImage src={message.data.avatarUrl} />
        </Avatar>
        <p>{message.data.text}</p>
      </div>
    </li>
  );

  return <ul>{messages.map(createLi)}</ul>;
};
export default MessageList;
