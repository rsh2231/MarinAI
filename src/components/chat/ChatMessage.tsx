"use client";
import { Message } from "@/types/Message";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Lottie from "lottie-react";
import AI from "@/assets/animations/AI.json";
import React, { useState, useEffect } from "react";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [displayedContent, setDisplayedContent] = useState("");

  // 타이핑 효과 훅
  useEffect(() => {
    // 사용자의 메시지는 타이핑 효과 없이 즉시 표시합니다.
    if (isUser) {
      setDisplayedContent(message.content || "");
      return;
    }

    // AI의 메시지에 타이핑 효과를 적용합니다.
    const targetContent = message.content || "";
    const currentLength = displayedContent.length;

    // 표시된 내용이 최종 내용보다 짧을 경우에만 타이핑을 계속합니다.
    if (currentLength < targetContent.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedContent(targetContent.slice(0, currentLength + 1));
      }, 30);

      // 컴포넌트가 unmount되거나 effect가 다시 실행될 때(새로운 청크 도착 등) timeout을 정리합니다.
      return () => clearTimeout(timeoutId);
    }
  }, [message.content, displayedContent, isUser]); // message.content나 displayedContent가 변경될 때마다 이 effect가 실행됩니다.

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2 sm:gap-4 ${isUser ? "justify-end" : ""}`}
    >
      {/* AI 아바타 */}
      {!isUser && (
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
           <Lottie animationData={AI} />
        </div>
      )}

      {/* 메시지 버블 컨테이너 */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${isUser
              ? "bg-neutral-700 text-white rounded-br-none"
              : "bg-neutral-700 text-neutral-200 rounded-bl-none"
            }`}
        >
          {/* 텍스트 컨텐츠 */}
          {message.content && (
            <div className="prose prose-sm prose-invert max-w-none 
              prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 
              prose-pre:bg-neutral-800 prose-pre:p-3 prose-pre:rounded-md text-sm md:text-md">
              {/* ✅ displayedContent를 렌더링하고, 타이핑 중일 때 커서(▋) 효과를 추가합니다. */}
              <Markdown remarkPlugins={[remarkGfm]}>
                {displayedContent + (displayedContent.length < (message.content || '').length ? '▋' : '')}
              </Markdown>
            </div>
          )}

          {/* 이미지 컨텐츠 */}
          {message.image && (
            <div className={`mt-2 ${!message.content ? "mt-0" : ""}`}>
              <img
                src={message.image}
                alt="첨부 이미지"
                className="max-w-full max-h-[300px] rounded-lg border border-neutral-600"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}