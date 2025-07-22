"use client";
import React from "react";
import ChatPageContent from "@/components/chat/ChatPageContent";

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="h-screen w-full" />}>
      <ChatPageContent />
    </React.Suspense>
  );
}
