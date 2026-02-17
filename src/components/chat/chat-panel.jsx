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

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !channelSlug) return;
    const form = new FormData();
    form.set("channel", channelSlug);
    form.set("file", file);
    try {
      const res = await fetch("/api/chat/upload", { method: "POST", body: form });
      if (res.ok) {
        refetchMessages();
        if (onMessageSent) onMessageSent();
      }
    } finally {
      e.target.value = "";
    }
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
      <div className="flex w-full shrink-0 items-center gap-2 border-t border-(--chat-input-wrap-border) bg-(--chat-input-wrap-bg) p-(--chat-panel-padding)">
        <label className="cursor-pointer rounded border px-2 py-2 text-sm hover:bg-gray-100">
          PDF
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>
        <MessageInput onSubmit={publishMessage} />
      </div>
    </div>
  );
};
export default Chat;
