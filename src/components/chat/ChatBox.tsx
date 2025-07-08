"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

export default function ChatBox() {
  // 1. 쿼리 파라미터에서 초기값 가져오기
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("initialQuestion") || "";
  const initialImageUrl = searchParams.get("imageUrl") || "";

// 2. 훅에 초기값을 전달
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

  // 스마트 스크롤 로직
  useEffect(() => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      const { scrollHeight, scrollTop, clientHeight } = chatContainer;
      // 사용자가 스크롤을 많이 올리지 않았을 때만 자동 스크롤
      if (scrollHeight - scrollTop < clientHeight + 200) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full h-[85vh] rounded-2xl border border-neutral-700 bg-neutral-900/80 shadow-2xl">
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-neutral-800 pt-4">
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="text-neutral-400 text-sm mb-2 select-none self-start flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>AI가 생각 중...</span>
          </div>
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading}
          onImageUpload={setUploadedImage}
          uploadedImage={uploadedImage}
        />
      </div>
    </div>
  );
}