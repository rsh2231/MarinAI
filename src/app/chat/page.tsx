"use client";

import { useSearchParams } from "next/navigation";
import ChatBox from "@/components/chat/ChatBox";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("initialQuestion") ?? "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <ChatBox initialQuestion={initialQuestion} />
    </div>
  );
}
