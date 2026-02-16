import MessageInput from "./message-input";
import MessageList from "./message-list";
import styles from "./chat-panel.module.css";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChannel } from "ably/react";
import { useUser } from "@clerk/nextjs";

const Chat = ({ channelName, onMessageSent, onMessageReceived }) => {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState([]);
  const messagesScrollRef = useRef(null);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const channelSlug = channelName?.startsWith("chat:")
    ? channelName.slice(5)
    : channelName;

  const refetchMessages = useCallback(() => {
    if (!channelSlug) return;
    fetch(`/api/chat/messages?channel=${encodeURIComponent(channelSlug)}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => {});
  }, [channelSlug]);

  useEffect(() => {
    if (!channelSlug) return;
    let cancelled = false;
    fetch(`/api/chat/messages?channel=${encodeURIComponent(channelSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [channelSlug]);

  function handleNewMessage(event) {
    const data = event.data || event;
    const id = data.id ?? event.id ?? `live-${Date.now()}`;
    const msg = {
      id,
      name: event.name || "ADD",
      data: typeof data.data !== "undefined" ? data : { ...data },
      timestamp: data.timestamp ?? new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
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
    publish({
      name: "ADD",
      data: {
        text,
        avatarUrl: user.imageUrl,
        senderId: user.id,
      },
    });
  }

  return (
    <div className={`${styles.root} flex h-full w-full min-w-0 flex-col`}>
      <div
        ref={messagesScrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-(--chat-messages-bg) p-(--chat-panel-padding)"
      >
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          onRefetchMessages={refetchMessages}
        />
      </div>
      <div className="flex w-full shrink-0 items-center border-t border-(--chat-input-wrap-border) bg-(--chat-input-wrap-bg) p-(--chat-panel-padding)">
        <MessageInput onSubmit={publishMessage} />
      </div>
    </div>
  );
};
export default Chat;
