"use client";
import Chat from "@/app/(routes)/[[...channelName]]/chat/chat";
import ChannelList from "@/app/(routes)/[[...channelName]]/chat/channel-list";
import { Realtime } from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";

const Page = ({ params }) => {
  const channels = [
    { path: "/chat/announcements", label: "# Announcements" },
    { path: "/chat/general", label: "# General" },
    { path: "/chat/random", label: "# Random" },
    { path: "/chat/mods-only", label: "# Mods-only", modOnly: true },
  ];

  const client = new Realtime({
    key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
    autoConnect: typeof window !== "undefined",
  });
  const channelName = `chat:${params.channel}`;

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channelName}>
        <div className="grid h-[calc(100vh-72.8px)] grid-cols-4">
          <div className="border-r border-gray-200 p-5">
            <ChannelList channels={channels} />
          </div>
          <div className="col-span-2">
            <Chat channelName={channelName} />
          </div>
          <div className="border-l border-gray-200 p-5"></div>
        </div>
      </ChannelProvider>
    </AblyProvider>
  );
};
export default Page;
