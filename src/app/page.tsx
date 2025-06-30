"use client";

import { useState, useRef } from "react";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { SendHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Home() {
  const [input, setInput] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoResizeTextarea(textareaRef, input);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/chat?initialQuestion=${encodeURIComponent(input.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 overflow-hidden bg-background"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text mb-4 z-10 select-none"
      >
        Marin<span className="text-blue-500">AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-xl text-center text-gray-400 text-base sm:text-lg mb-12 z-10 leading-relaxed"
      >
        질문을 입력하거나 <br />
        문제를 복사해 붙여넣고 AI와 함께 학습하세요.
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="z-10 w-full max-w-2xl bg-background-dark border border-gray-700 rounded-2xl p-5 shadow-lg space-y-4"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="무엇이 궁금하신가요?"
          className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-4 text-base max-h-40 overflow-y-auto transition-shadow duration-300"
          rows={1}
          required
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="neutral"
            className="flex items-center gap-2"
          >
            <SendHorizontal className="w-5 h-5" />
            시작
          </Button>
        </div>
      </motion.form>

      {/* 기존 배경 회전 이미지 유지 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] z-0 select-none pointer-events-none"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 60,
            ease: "linear",
            delay: 2.2,
          }}
          className="w-full h-full"
        >
          <Image
            src="/images/wheel.png"
            alt="Ship Wheel"
            fill
            style={{ objectFit: "contain" }}
            priority
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
