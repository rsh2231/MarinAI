"use client";

import React, { useEffect, useRef, Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages, messages.map(m => m.content).join("")]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 메시지 영역: flex-grow로 남은 공간을 모두 차지하고, 내용이 넘칠 때 스크롤됩니다. */}
      <div
        ref={scrollContainerRef}
        className="flex-grow min-h-0 overflow-y-auto p-4 sm:px-6 space-y-4 max-w-full sm:max-w-3xl mx-auto w-full"
      >
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isStreaming={
              isLoading &&
              index === messages.length - 1 &&
              msg.role === "assistant"
            }
          />
        ))}
      </div>

      {/* 하단 입력창: Flexbox의 자식으로 자연스럽게 하단에 위치합니다. */}
      <div className="w-full">
        <div className="mx-auto w-full max-w-full sm:max-w-4xl px-3 sm:px-6 py-3 break-keep">
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" &&
            !messages[messages.length - 1].content && (
              <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
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
    </div>
  );
}
export default function ChatBox() {
  return (
    <Suspense fallback={<div className="w-full text-center text-white">대화 내용을 불러오는 중...</div>}>
      <ChatBoxContent />
    </Suspense>
  );
}
