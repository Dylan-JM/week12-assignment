import MessageInput from "./message-input";
import MessageList from "./message-list";

import { useReducer } from "react";
import { useChannel } from "ably/react";
import { useUser } from "@clerk/nextjs";

const ADD = "ADD";

const reducer = (prev, event) => {
  switch (event.name) {
    // 👉 Append the message to messages
    case ADD:
      return [...prev, event];
  }
};

const Chat = ({ channelName }) => {
  // 👉 Placeholder user to be replaced with the authenticated user later
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null; // or a loading spinner
  }
  const [messages, dispatch] = useReducer(reducer, []);
  // 👉 useChannel accepts the channel name and a function to invoke when
  //    new messages are received. We pass dispatch.
  const { channel, publish } = useChannel(channelName, dispatch);

  const publishMessage = (text) => {
    // 👉 Publish event through Ably
    publish({
      name: ADD,
      data: {
        text,
        avatarUrl: user.imageUrl,
      },
    });
  };

  return (
    <>
      <div className="overflow-y-auto p-5">
        <MessageList messages={messages} />
      </div>
      <div className="mt-auto p-5">
        <MessageInput onSubmit={publishMessage} />
      </div>
    </>
  );
};
export default Chat;
