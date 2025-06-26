'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-background-dark text-foreground-dark overflow-hidden"
    >
      {/* 텍스트 */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-4 select-none z-10">
        Marin<span className='text-blue-500'>AI</span>
      </h1>
      <p className="max-w-xl text-foreground-dark/80 text-base sm:text-lg mb-12 text-center leading-relaxed z-10">
        궁금한 점을 질문하거나,<br />
        문제를 복사해 붙여넣고 AI와 함께 학습하세요.
      </p>

       {/* 회전 휠 (텍스트보다 늦게 시작) */}
      <motion.div
        className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] opacity-10 z-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear", delay:1.2 }}
      >
        <Image
          src="/images/wheel.png"
          alt="Ship Wheel"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </motion.div>
    </motion.div>
  );
}
