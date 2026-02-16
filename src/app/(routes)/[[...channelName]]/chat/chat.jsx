import MessageInput from "./message-input";
import MessageList from "./message-list";

import { useReducer, useEffect, useCallback } from "react";
import { useChannel } from "ably/react";
import { useUser } from "@clerk/nextjs";

const ADD = "ADD";
const SET = "SET";

const reducer = (prev, event) => {
  if (event.name === SET) {
    return event.data ?? prev;
  }
  if (event.name === ADD) {
    return [...prev, event];
  }
  return prev;
};

const Chat = ({ channelName, onMessageSent, onMessageReceived }) => {
  const { user, isLoaded } = useUser();
  const [messages, dispatch] = useReducer(reducer, []);
  const handleChannelMessage = useCallback(
    (event) => {
      dispatch(event);
      if (event.name === ADD) onMessageReceived?.();
    },
    [onMessageReceived]
  );
  const { channel, publish } = useChannel(channelName, handleChannelMessage);

  const channelSlug = channelName?.startsWith("chat:") ? channelName.slice(5) : channelName;

  useEffect(() => {
    if (!channelSlug) return;
    fetch(`/api/chat/messages?channel=${encodeURIComponent(channelSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) {
          dispatch({ name: SET, data: data.messages });
        }
      })
      .catch(() => {});
  }, [channelSlug]);

  if (!isLoaded || !user) {
    return null;
  }

  const publishMessage = (text) => {
    const payload = {
      name: ADD,
      data: { text, avatarUrl: user.imageUrl },
    };
    fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channelSlug, content: text }),
    })
      .then((res) => {
        if (res.ok) onMessageSent?.();
      })
      .catch(() => {});
    publish(payload);
  };

  return (
    <>
      <div className="overflow-y-auto p-5">
        <MessageList messages={messages} currentUserId={user?.id} />
      </div>
      <div className="mt-auto p-5">
        <MessageInput onSubmit={publishMessage} />
      </div>
    </>
  );
};
export default Chat;
