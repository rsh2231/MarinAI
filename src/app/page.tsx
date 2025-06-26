'use client';

import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}   // 시작 상태: 투명 + 아래 위치
      animate={{ opacity: 1, y: 0 }}    // 애니메이션 후 상태: 보임 + 원래 위치
      transition={{ duration: 0.6, ease: 'easeOut' }}  // 지속 시간, 곡선
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
    >
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4 select-none">
        ⚓ MarinAI
      </h1>
      <p className="max-w-xl text-gray-600 text-base sm:text-lg mb-12 text-center leading-relaxed">
        궁금한 점을 질문하거나, 문제를 복사해 붙여넣고 AI와 함께 학습하세요.
      </p>
    </motion.div>
  );
}
