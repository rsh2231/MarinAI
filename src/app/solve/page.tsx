"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { SUBJECTS_BY_LICENSE } from "@/lib/constants";

import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/solve/ProblemViewer";
import CbtViewer from "@/components/cbt/CbtViewer";
import { OmrSheet } from "@/components/cbt/OmrSheet"; // OMR 시트 import
import Button from "@/components/ui/Button";

export default function SolvePage() {
  const [year, setYear] = useState("2023");
  const [license, setLicense] = useState<"항해사" | "기관사" | "소형선박조종사" | null>("기관사");
  const [level, setLevel] = useState("3급");
  const [round, setRound] = useState("1회");
  const [mode, setMode] = useState<"practice" | "exam" | null>("exam");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (license) {
      const defaultSubjects = SUBJECTS_BY_LICENSE[license] || [];
      setSelectedSubjects(defaultSubjects);
    }
  }, [license]);

  const filterState = { year, setYear, license, setLicense, level, setLevel, round, setRound, selectedSubjects, setSelectedSubjects };
  const isFilterReady = year && license && round && (license === "소형선박조종사" || level);
  const cbtProps = { year, license: license!, level, round, selectedSubjects };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-full min-h-screen bg-[#0f172a] text-white p-4"
    >
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* 왼쪽: 필터 (lg 사이즈 이상에서 보임) */}
        <div className="hidden lg:block lg:col-span-3">
          <Sidebar filterState={filterState} className="h-full rounded-lg bg-[#1e293b] border border-gray-700" />
        </div>

        {/* 중앙: 메인 콘텐츠 */}
        <div className="col-span-12 lg:col-span-6">
          {(!mode || !isFilterReady) ? (
            <div className="flex flex-col items-center justify-center text-center bg-[#0f172a] h-full p-6 sm:p-10 rounded-lg border border-gray-700 shadow">
                <Lightbulb className="w-10 h-10 text-blue-400 mb-4 animate-pulse" />
                <p className="text-base text-gray-300 font-medium leading-relaxed mb-6">
                    <span className="text-blue-400 font-semibold">필터</span>에서 시험 정보를 선택하고<br />
                    <span className="text-blue-400 font-semibold">연습 또는 실전 모드</span>를 시작하세요!
                </p>
                {isFilterReady && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 justify-center">
                        <Button onClick={() => setMode("practice")} variant="neutral" size="md" selected={mode === "practice"}>연습 모드</Button>
                        <Button onClick={() => setMode("exam")} variant="neutral" size="md" selected={mode === "exam"}>실전 모드</Button>
                    </motion.div>
                )}
            </div>
          ) : mode === 'practice' ? (
            <ProblemViewer {...cbtProps} />
          ) : (
            <CbtViewer {...cbtProps} durationMinutes={125} />
          )}
        </div>

        {/* 오른쪽: OMR 시트 (CBT 모드이고 lg 사이즈 이상일 때만 보임) */}
        <div className="hidden lg:block lg:col-span-3">
          {isFilterReady && mode === 'exam' && <OmrSheet />}
        </div>
      </div>
    </motion.div>
  );
}