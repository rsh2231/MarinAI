"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* 텍스트 */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-5xl font-extrabold text-primary mb-4 select-none z-10"
      >
        Marin<span className="text-blue-500">AI</span>
      </motion.h1>

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

      {/* 휠 등장 + 회전 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] z-0"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 60,
            ease: "linear",
            delay: 2.2,
          }} // 휠 등장이 끝난 후 회전 시작
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
