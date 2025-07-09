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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 스크롤 위치를 감지하는 함수
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 5; // 5px 정도의 오차 허용
      setIsAtBottom(isScrolledToBottom);
    }
  }, []);

  // 자동 스크롤을 수행하는 함수
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };
  useEffect(() => {
    scrollToBottom("auto");
  }, [messages.length]);

  useEffect(() => {
    if (isAtBottom) {
      const timeout = setTimeout(() => {
        scrollToBottom("smooth");
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [messages.map(m => m.content).join(""), isAtBottom]);
  
  return (
    <div className="h-full flex flex-col">
      {/* 메시지 영역 */}
      <div
        ref={scrollContainerRef} // 스크롤 컨테이너에 ref 연결
        onScroll={handleScroll} // 스크롤 이벤트에 핸들러 연결
        className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-4 max-w-full sm:max-w-3xl mx-auto w-full pb-32"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 고정 입력창 */}
      <div className="shrink-0 bg-neutral-900 bg-opacity-90 backdrop-blur-sm border-t border-neutral-800">
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
