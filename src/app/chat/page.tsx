"use client";

import ChatBox from "@/components/ui/ChatBox";

export default function ChatPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GPT 해기사 Q&A</h1>
      <ChatBox />
    </div>
  );
}
