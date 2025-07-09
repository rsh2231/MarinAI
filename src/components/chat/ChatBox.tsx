"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput";
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
    <div className="relative w-full h-full">
      <div className="mx-auto max-w-3xl w-full">
        <div className="space-y-5 p-4 sm:p-6 pb-40">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 하단 고정 입력 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 bg-opacity-80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl w-full">
          <div className="border-t border-neutral-800 p-4 sm:p-6">
            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              !messages[messages.length - 1].content && (
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
      </div>
    </div>
  );
}

// Suspense로 감싸 최종적으로 내보내는 컴포넌트
export default function ChatBox() {
  return (
    <Suspense
      fallback={
        <div className="w-full text-center text-white">
          대화 내용을 불러오는 중...
        </div>
      }
    >
      <ChatBoxContent />
    </Suspense>
  );
}
