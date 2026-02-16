import MessageInput from "./message-input";
import MessageList from "./message-list";

import { useState, useEffect, useCallback } from "react";
import { useChannel } from "ably/react";
import { useUser } from "@clerk/nextjs";

const Chat = ({ channelName, onMessageSent, onMessageReceived }) => {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState([]);

  const channelSlug = channelName?.startsWith("chat:") ? channelName.slice(5) : channelName;

  const refetchMessages = useCallback(() => {
    if (!channelSlug) return;
    fetch(`/api/chat/messages?channel=${encodeURIComponent(channelSlug)}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => {});
  }, [channelSlug]);

  useEffect(() => {
    if (!channelSlug) return;
    refetchMessages();
  }, [channelSlug, refetchMessages]);

  function handleNewMessage(event) {
    setMessages((prev) => [...prev, { ...event, id: event.id || `live-${Date.now()}` }]);
    if (onMessageReceived) onMessageReceived();
  }
  const { publish } = useChannel(channelName, handleNewMessage);

  if (!isLoaded || !user) {
    return null;
  }

  function publishMessage(text) {
    fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channelSlug, content: text }),
    })
      .then((res) => {
        if (res.ok && onMessageSent) onMessageSent();
      })
      .catch(() => {});
    publish({ name: "ADD", data: { text, avatarUrl: user.imageUrl } });
  }

  return (
    <>
      <div className="overflow-y-auto p-5">
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          onRefetchMessages={refetchMessages}
        />
      </div>
      <div className="mt-auto p-5">
        <MessageInput onSubmit={publishMessage} />
      </div>
    </>
  );
};
export default Chat;
