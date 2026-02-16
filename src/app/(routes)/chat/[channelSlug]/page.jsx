"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ChatChannelRedirect() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.channelSlug;

  useEffect(() => {
    if (slug) {
      router.replace(`/chat?channel=${encodeURIComponent(slug)}`, {
        scroll: false,
      });
    } else {
      router.replace("/chat", { scroll: false });
    }
  }, [slug, router]);

  return null;
}
