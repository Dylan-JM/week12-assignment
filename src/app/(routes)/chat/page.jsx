"use client";

import { ChannelProvider } from "ably/react";
import Chat from "@/app/(routes)/[[...channelName]]/chat/chat";
import { useChatLayout } from "./chat-layout-context";

export default function ChatPage() {
  const {
    selectedChannelSlug,
    fetchConversations,
  } = useChatLayout();

  const channelName = selectedChannelSlug ? `chat:${selectedChannelSlug}` : null;

  if (!channelName) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        <p>Select a conversation from the list</p>
      </div>
    );
  }

  return (
    <ChannelProvider channelName={channelName}>
      <Chat
        channelName={channelName}
        onMessageSent={() => fetchConversations({ silent: true })}
        onMessageReceived={() => fetchConversations({ silent: true })}
      />
    </ChannelProvider>
  );
}
