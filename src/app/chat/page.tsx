"use client";
import React from "react";
import ChatBox from "@/components/chat/ChatBox";

export default function ChatPage() {
  // Suspense를 사용하여 searchParams를 안전하게 읽도록 보장
  return (
    <React.Suspense
      fallback={<div className="h-screen w-full bg-neutral-900" />}
    >
      <ChatPageContent />
    </React.Suspense>
  );
}

function ChatPageContent() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-900 p-4">
      <ChatBox />
    </div>
  );
}
