"use client";
import React from "react";
import ChatBox from "@/components/chat/ChatBox";

export default function ChatPage() {
  // Suspense를 사용하여 searchParams를 안전하게 읽도록 보장
  return (
    <React.Suspense
      fallback={<div className="h-screen w-full" />}
    >
      <ChatPageContent />
    </React.Suspense>
  );
}

function ChatPageContent() {
  return <ChatBox />;
}
