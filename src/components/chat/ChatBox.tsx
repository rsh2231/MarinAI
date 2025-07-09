"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput"; // 통합된 ChatInput
import ChatMessage from "./ChatMessage";

// searchParams를 읽는 컴포넌트를 분리하여 Suspense 사용
function ChatBoxContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("initialQuestion") || "";
  const initialImageUrl = searchParams.get("imageUrl") || "";

  const {
    messages,
    input,
    setInput,
    isLoading,
    uploadedImage,
    setUploadedImage,
    handleSubmit,
  } = useChat(initialQuestion, initialImageUrl);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col rounded-2xl border border-neutral-700 bg-neutral-900/80 shadow-2xl">
      <div className="flex-grow space-y-5 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-700 sm:p-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-800 p-4 sm:p-6">
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].content && (
          <div className="mb-2 flex items-center gap-2 self-start select-none text-sm text-neutral-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span>MarinAI가 답변을 생성 중입니다...</span>
          </div>
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading}
          onImageUpload={setUploadedImage}
          uploadedImage={uploadedImage}
          placeholder="추가 질문을 입력하거나 이미지를 첨부하세요..."
        />
      </div>
    </div>
  );
}

// 최종적으로 내보낼 컴포넌트
export default function ChatBox() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatBoxContent />
    </Suspense>
  )
}