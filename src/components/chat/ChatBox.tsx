"use client";

import React, { useRef, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import useResizeObserver from "use-resize-observer";

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
    stop,
  } = useChat(initialQuestion, initialImageUrl);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { ref: messagesContainerRef } = useResizeObserver<HTMLDivElement>({
    onResize: () => {
      const scrollEl = scrollContainerRef.current;
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    },
  });

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, [messages.length]); // messages.length가 바뀔 때 (메시지 개수가 바뀔 때) 실행

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
        <div
          ref={messagesContainerRef}
          className="p-4 px-3 sm:px-6 space-y-4 max-w-full mx-auto w-full md:max-w-3xl lg:max-w-4xl"
        >
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={
                isLoading &&
                idx === messages.length - 1 &&
                msg.role === "assistant"
              }
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 z-20">
        <div className="mx-auto w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl px-3 sm:px-6 py-3">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
            onImageUpload={setUploadedImage}
            uploadedImage={uploadedImage}
            placeholder="무엇이든 물어보세요"
            onStop={stop}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatBox() {
  return (
    <Suspense
      fallback={
        <div className="w-full text-center text-white py-10">
          대화 내용을 불러오는 중...
        </div>
      }
    >
      <ChatBoxContent />
    </Suspense>
  );
}
