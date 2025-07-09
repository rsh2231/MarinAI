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

  // 자동 스크롤을 수행하는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // 메시지 목록이나 내용이 변경될 때마다 항상 맨 아래로 스크롤
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100); // 스트리밍 렌더링을 위한 약간의 지연
    return () => clearTimeout(timeout);
  }, [messages, messages.map(m => m.content).join("")]);
  
  return (
    <div className="h-full w-full relative">
      {/* 메시지 영역: 이제 전체 높이를 차지하고 스스로 스크롤됩니다. */}
      <div className="h-full overflow-y-auto p-4 sm:px-6 space-y-4 max-w-full sm:max-w-3xl mx-auto w-full pb-40"> {/* 입력창 높이를 고려한 하단 패딩 */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 고정 입력창: absolute 포지션으로 하단에 고정 */}
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-900 bg-opacity-90 backdrop-blur-sm border-t border-neutral-800">
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
