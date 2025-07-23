"use client";

import React, { useRef, useInsertionEffect } from "react";
import { Message } from "@/types/Message";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import AI from "@/assets/animations/AI.json";
import TypingMarkdown from "./TypingMarkdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  // 메시지 컨테이너 요소를 참조하기 위한 ref
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // useInsertionEffect : 레이아웃 계산 전에 DOM 변경을 삽입하여 레이아웃 변경을 최소화
  useInsertionEffect(() => {
    if (message.image) {
      const img = new Image();
      img.onload = () => {
        if (messageContainerRef.current) {
          messageContainerRef.current.style.height = `${img.height}px`;
        }
      };
      img.src = message.image;
    }
  }, [message.image]);

  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2 sm:gap-4 ${
        isUser ? "justify-end" : ""
      }`}
    >
      {/* AI 아바타 */}
      {!isUser && (
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
          <Lottie animationData={AI} />
        </div>
      )}

      {/* 메시지 버블 */}
      <div
        className={`flex flex-col max-w-[80%] sm:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
            isUser
              ? "bg-neutral-700 text-white rounded-br-none"
              : "bg-neutral-700 text-neutral-200 rounded-bl-none"
          }`}
        >
          {message.content &&
            (isUser ? (
              // 사용자 메시지는 그대로 일반 Markdown 사용
              <div className="...">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </Markdown>
              </div>
            ) : (
              // AI 메시지는 항상 TypingMarkdown 사용
              <TypingMarkdown
                content={message.content}
                isStreaming={isStreaming || false} // isStreaming이 undefined가 될 수 있으므로 기본값 추가
              />
            ))}
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
