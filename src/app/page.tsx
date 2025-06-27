"use client";

import { useState, useRef } from "react";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Home() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/chat?initialQuestion=${encodeURIComponent(input.trim())}`);
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoResizeTextarea(textareaRef, input);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* 타이틀 */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-5xl font-extrabold text-primary mb-4 select-none z-10"
      >
        Marin<span className="text-blue-500">AI</span>
      </motion.h1>

      {/* 설명 텍스트 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-xl text-foreground-dark/80 text-base sm:text-lg mb-12 text-center leading-relaxed z-10"
      >
        궁금한 점을 질문하거나,
        <br />
        문제를 복사해 붙여넣고 AI와 함께 학습하세요.
      </motion.p>

      {/* 질문 입력 폼 */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="z-10 w-full max-w-2xl flex flex-col gap-3"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="여기에 질문을 입력하세요..."
          className="flex-grow p-3 rounded-md border border-gray-600 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-h-40 overflow-y-auto"
          required
        />
        <div className="flex justify-end">
          <Button type="submit" variant="neutral">
            시작
          </Button>
        </div>
      </motion.form>

      {/* 휠 등장 + 회전 (배경) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] z-0"
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
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
