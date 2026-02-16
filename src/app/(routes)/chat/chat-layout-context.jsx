"use client";

import { createContext, useContext } from "react";

export const ChatLayoutContext = createContext(null);

export function useChatLayout() {
  const ctx = useContext(ChatLayoutContext);
  if (!ctx) throw new Error("useChatLayout must be used within ChatLayout");
  return ctx;
}
