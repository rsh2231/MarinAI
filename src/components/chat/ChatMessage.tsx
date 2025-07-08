"use client";
import { Message } from "@/types/Message";
import Image from "next/image";
import { motion } from "framer-motion";
import Markdown from "react-markdown"; // 마크다운 렌더링을 위해
import remarkGfm from 'remark-gfm'; // GFM (테이블, 취소선 등) 지원
import Lottie from "lottie-react";
import AI from "@/assets/animations/AI.json";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <Lottie animationData={AI} className="w-20 h-20" />
      )}

      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"
          }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-neutral-700 text-neutral-200 rounded-bl-none"
            }`}
        >
          {message.content && (
            <div className="prose prose-sm prose-invert max-w-none prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2">
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
            </div>
          )}
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