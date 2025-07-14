"use client";

import { Message } from "@/types/Message";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Lottie from "lottie-react";
import AI from "@/assets/animations/AI.json";
import TypingMarkdown from "./TypingMarkdown";

export default function ChatMessage({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

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

      {/* 메시지 버블 */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-neutral-700 text-white rounded-br-none"
              : "bg-neutral-700 text-neutral-200 rounded-bl-none"
          }`}
        >
          {/* ✅ 텍스트 컨텐츠 */}
          {message.content && (
            isUser || !isStreaming ? (
              <div className="prose prose-sm prose-invert max-w-none 
                prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 
                prose-pre:bg-neutral-800 prose-pre:p-3 prose-pre:rounded-md text-sm md:text-md">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </Markdown>
              </div>
            ) : (
              <TypingMarkdown content={message.content} isStreaming={true} />
            )
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
