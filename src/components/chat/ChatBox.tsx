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

  // ✅ 2. 메시지 목록을 감싸는 내부 div를 위한 ref를 추가합니다.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ 3. useResizeObserver를 사용하여 메시지 목록 컨테이너의 크기 변화를 감지합니다.
  const { ref: messagesContainerRef } = useResizeObserver<HTMLDivElement>({
    onResize: () => {
      // ✅ 4. 크기가 변경될 때마다 (즉, 타이핑으로 텍스트가 추가될 때마다) 스크롤을 맨 아래로 내립니다.
      const scrollEl = scrollContainerRef.current;
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    },
  });

  // ✅ 5. 최초 로드 시 또는 사용자가 새 메시지를 보냈을 때 즉시 스크롤하기 위한 보조 useEffect
  // 이 부분은 타이핑이 없는 유저 메시지에 즉각 반응하기 위해 남겨두는 것이 좋습니다.
  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }, [messages.length]); // messages.length가 바뀔 때 (메시지 개수가 바뀔 때) 실행

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
        {/* ✅ 6. 메시지 목록을 감싸는 div에 'messagesContainerRef'를 연결합니다. */}
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
