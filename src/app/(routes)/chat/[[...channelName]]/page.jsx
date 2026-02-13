"use client";

import { use, useMemo, useEffect, useState } from "react";
import Chat from "@/app/(routes)/[[...channelName]]/chat/chat";
import ContactsList from "@/app/(routes)/[[...channelName]]/chat/contacts-list";
import { Realtime } from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { useUser } from "@clerk/nextjs";

const Page = ({ params }) => {
  const resolvedParams = use(params);
  const { user, isLoaded } = useUser();
  const [contacts, setContacts] = useState([]);
  const [role, setRole] = useState(null);
  const [contactsError, setContactsError] = useState(null);

  const channelSlug = Array.isArray(resolvedParams?.channelName)
    ? resolvedParams.channelName[0]
    : resolvedParams?.channelName;
  const channelName = channelSlug ? `chat:${channelSlug}` : null;

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/chat/contacts")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Sign in required" : "Failed to load contacts");
        return res.json();
      })
      .then((data) => {
        setRole(data.role);
        setContacts(data.contacts ?? []);
      })
      .catch((err) => setContactsError(err.message));
  }, [isLoaded, user]);

  const client = useMemo(
    () =>
      new Realtime({
        authUrl: "/api/ably",
        autoConnect: typeof window !== "undefined",
      }),
    []
  );

  if (!isLoaded) {
    return (
      <div className="grid h-[calc(100vh-72.8px)] grid-cols-4">
        <div className="border-r border-gray-200 p-5">Loading…</div>
        <div className="col-span-3 flex items-center justify-center text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-72.8px)] items-center justify-center">
        <p className="text-gray-600">Please sign in to use messaging.</p>
      </div>
    );
  }

  if (contactsError) {
    return (
      <div className="flex h-[calc(100vh-72.8px)] items-center justify-center">
        <p className="text-gray-600">{contactsError}</p>
      </div>
    );
  }

  return (
    <AblyProvider client={client}>
      <div className="grid h-[calc(100vh-72.8px)] grid-cols-4">
        <aside className="border-r border-gray-200 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {role === "freelancer" ? "Clients" : "Freelancers"}
          </h2>
          <ContactsList
            contacts={contacts}
            currentUserId={user.id}
            basePath="/chat"
          />
        </aside>
        <main className="col-span-3 flex flex-col">
          {channelName ? (
            <ChannelProvider channelName={channelName}>
              <Chat channelName={channelName} />
            </ChannelProvider>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              <p>Select a conversation from the list</p>
            </div>
          )}
        </main>
      </div>
    </AblyProvider>
  );
};

export default Page;
