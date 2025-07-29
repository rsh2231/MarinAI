"use client";

import { useRef } from "react";
import { motion, Variants } from "framer-motion";
import MyPageHeader from "./MyPageHeader";
import MyPageCharts from "./MyPageCharts";
import MyPageReports from "./MyPageReports";
import AILearningDiagnosis from "@/components/mypage/reports/AILearningDiagnosis";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";


import { useState } from "react";

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      delay,
    },
  }),
};

export default function MyPageClient() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 오답노트와 시험결과 상태를 최상위에서 관리
  const [wrongNotes, setWrongNotes] = useState<unknown[]>([]); // 실제 WrongNote[] 타입
  const [examResults, setExamResults] = useState<unknown[]>([]); // 실제 ExamResult[] 타입

  // ExamResultView가 기대하는 타입에 맞춰 래퍼 함수 생성
  const handleSetExamResults = (results: unknown) => {
    if (Array.isArray(results)) {
      setExamResults(results);
    } else {
      setExamResults([results]);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="bg-neutral-900 h-screen overflow-auto"
    >
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-35">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <MyPageHeader />
        </motion.div>

        <div className="flex flex-col gap-6 mt-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={0.1}
          >
            <MyPageCharts />
          </motion.div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={0.2}
          >
            <AILearningDiagnosis wrongNotes={wrongNotes} examResults={examResults} />
          </motion.div>

          <MyPageReports
            setWrongNotes={setWrongNotes}
            setExamResults={handleSetExamResults}
          />
        </div>
      </main>

      <ScrollToTopButton
        className="fixed bottom-6 right-6 lg:right-15 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
        scrollableRef={scrollContainerRef}
      />
    </div>
  );
}
