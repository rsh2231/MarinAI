"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { SUBJECTS_BY_LICENSE } from "@/lib/constants";
import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/solve/ProblemViewer";
import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebarAtom";

export default function SolvePage() {
  const [year, setYear] = useState("");
  const [license, setLicense] = useState<"항해사" | "기관사" | "소형선박조종사" | "">("");
  const [level, setLevel] = useState("");
  const [round, setRound] = useState("");
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // 라이선스 변경 시 과목 초기화
  useEffect(() => {
    if (license) {
      const defaultSubjects = SUBJECTS_BY_LICENSE[license] || [];
      setSelectedSubjects(defaultSubjects);
    }
  }, [license]);

  const filterState = {
    year,
    setYear,
    license,
    setLicense,
    level,
    setLevel,
    round,
    setRound,
    selectedSubjects,
    setSelectedSubjects,
  };

  const isFilterReady =
    year && license && round && (license === "소형선박조종사" || level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 min-h-screen bg-[#1e293b] text-white overflow-x-auto"
    >

      {/* 사이드바 */}
      <Sidebar
        filterState={filterState}
        className="z-40 bg-[#1f2937] text-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-gray-700 rounded-xl"
      />

      {/* 메인 콘텐츠 */}
      <main
        className="flex-grow bg-[#1f2937] p-6 md:p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-gray-700
                   transition-all duration-300 min-w-0 overflow-auto"
      >
        {isFilterReady ? (
          <ProblemViewer
            year={year}
            license={license}
            level={license === "소형선박조종사" ? "" : level}
            round={round}
            selectedSubjects={selectedSubjects}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center bg-[#0f172a] mt-30 p-10 rounded-xl border border-gray-700 shadow-lg"
          >
            <Lightbulb className="w-10 h-10 text-blue-400 mb-4 animate-pulse" />
            <p className="text-lg text-gray-300 font-medium leading-relaxed">
              왼쪽 사이드바에서{" "}
              <span className="text-blue-400 font-semibold">연도</span>,
              <span className="text-blue-400 font-semibold">자격증</span>,
              <span className="text-blue-400 font-semibold">급수</span>,
              <span className="text-blue-400 font-semibold">회차</span>를 선택하면<br />
              문제를 자동으로 생성해드릴게요!
            </p>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
