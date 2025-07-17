"use client";

import { motion } from "framer-motion";

export default function HomePageHeader() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-6xl font-extrabold text-white mb-3 select-none"
      >
        Marin<span className="text-blue-500">AI</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-lg mx-auto text-neutral-400 text-base mb-12 leading-relaxed select-none break-keep"
      >
        해기사 시험 준비의 새로운 항해, <br />
        MarinAI와 함께 스마트하게 준비하세요.
      </motion.p>
    </>
  );
}