"use client";

import { Suspense, useMemo, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Realtime } from "ably";
import { AblyProvider } from "ably/react";
import { useUser } from "@clerk/nextjs";
import { clsx } from "clsx";
import ConversationList from "@/components/chat/conversation-list";
import { ChatLayoutContext } from "./chat-layout-context";
import styles from "./page.module.css";

const SIDEBAR_STORAGE_KEY = "chat-sidebar-expanded";
const SIDEBAR_WIDTH_COLLAPSED = "3.5rem";
const SIDEBAR_WIDTH_EXPANDED = "20rem";

function getInitialSidebarExpanded() {
  if (typeof window === "undefined") return true;
  const stored = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
  return stored !== "false";
}

function ChatLayoutFallback() {
  return (
    <div className="grid h-[calc(100vh-72.8px)] grid-cols-4">
      <div className="border-r border-gray-200 p-5">Loading…</div>
      <div className="col-span-3 flex items-center justify-center text-gray-500">
        Loading…
      </div>
    </div>
  );
}

function ChatLayoutInner({ children }) {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(
    getInitialSidebarExpanded,
  );
  const [selectedChannelSlug, setSelectedChannelSlug] = useState(null);

  useEffect(() => {
    const q = searchParams?.get("channel");
    if (q) {
      queueMicrotask(() => setSelectedChannelSlug(q));
    }
  }, [searchParams]);

  const handleSelectConversation = useCallback((slug) => {
    setSelectedChannelSlug(slug);
  }, []);

  const fetchConversations = useCallback(
    (options = {}) => {
      if (!user) return;
      const silent = options.silent === true;
      fetch("/api/chat/conversations")
        .then((res) => {
          if (!res.ok)
            throw new Error(
              res.status === 401 ? "Sign in required" : "Failed to load",
            );
          return res.json();
        })
        .then((data) => {
          setConversations(data.conversations ?? []);
        })
        .catch((err) => {
          if (!silent) setLoadError(err.message);
        });
    },
    [user],
  );

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchConversations();
  }, [isLoaded, user, fetchConversations]);

  const client = useMemo(
    () =>
      new Realtime({
        authUrl: "/api/ably",
        autoConnect: typeof window !== "undefined",
      }),
    [],
  );

  const contextValue = useMemo(
    () => ({
      user,
      isLoaded,
      loadError,
      conversations,
      selectedChannelSlug,
      fetchConversations,
    }),
    [
      user,
      isLoaded,
      loadError,
      conversations,
      selectedChannelSlug,
      fetchConversations,
    ],
  );

  if (!isLoaded) {
    return (
      <div className="grid h-[calc(100vh-72.8px)] grid-cols-4">
        <div className="border-r border-gray-200 p-5">Loading…</div>
        <div className="col-span-3 flex items-center justify-center text-gray-500">
          Loading…
        </div>
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

  if (loadError) {
    return (
      <div className="flex h-[calc(100vh-72.8px)] items-center justify-center">
        <p className="text-gray-600">{loadError}</p>
      </div>
    );
  }

  const sidebarWidth = sidebarExpanded
    ? SIDEBAR_WIDTH_EXPANDED
    : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <AblyProvider client={client}>
      <ChatLayoutContext.Provider value={contextValue}>
        <div
          className={`${styles.layout} grid h-[calc(100vh-72.8px)] w-full min-w-0`}
          style={{ gridTemplateColumns: `${sidebarWidth} 1fr` }}
        >
          <aside className="flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden border-r border-gray-200">
            <div
              className={clsx(
                "flex shrink-0 items-center border-b border-gray-200 p-2",
                sidebarExpanded ? "justify-between gap-1" : "justify-center",
              )}
            >
              {sidebarExpanded && (
                <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Messages
                </h2>
              )}
              <button
                type="button"
                onClick={() => {
                  setSidebarExpanded((e) => {
                    const next = !e;
                    sessionStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
                    return next;
                  });
                }}
                className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label={
                  sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
                }
              >
                {sidebarExpanded ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-2">
              <ConversationList
                conversations={conversations}
                currentUserId={user.id}
                basePath="/chat"
                collapsed={!sidebarExpanded}
                selectedChannelSlug={selectedChannelSlug}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          </aside>
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </ChatLayoutContext.Provider>
    </AblyProvider>
  );
}

export default function ChatLayout({ children }) {
  return (
    <Suspense fallback={<ChatLayoutFallback />}>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </Suspense>
  );
}
