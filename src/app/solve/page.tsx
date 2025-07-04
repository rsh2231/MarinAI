"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { SUBJECTS_BY_LICENSE } from "@/lib/constants";

import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/solve/ProblemViewer";
import CbtViewer from "@/components/cbt/CbtViewer";
import Button from "@/components/ui/Button";

export default function SolvePage() {
  // 1. 모든 상태를 "선택되지 않음"으로 초기화합니다.
  const [year, setYear] = useState("");
  const [license, setLicense] = useState<
    "항해사" | "기관사" | "소형선박조종사" | null
  >(null);
  const [level, setLevel] = useState("");
  const [round, setRound] = useState("");
  const [mode, setMode] = useState<"practice" | "exam" | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // 2. 라이선스 선택에 따라 기본 과목을 설정하거나 초기화합니다.
  useEffect(() => {
    if (license) {
      const defaultSubjects = SUBJECTS_BY_LICENSE[license] || [];
      setSelectedSubjects(defaultSubjects);
    } else {
      setSelectedSubjects([]);
    }
  }, [license]);

  // 3. 필터 값이 변경되면, mode를 초기화하여 다시 선택하도록 유도
  useEffect(() => {
    setMode(null);
  }, [year, license, level, round]);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0f172a] text-white"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-4 min-h-screen">
        {/* 왼쪽: 사이드바 */}
        <Sidebar
          filterState={filterState}
          // 사이드바의 반응형 스타일은 Sidebar 컴포넌트 내부에서 처리
          className="w-full md:w-64 lg:w-72 shrink-0"
        />

        {/* 오른쪽: 메인 콘텐츠 */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* 4. isFilterReady와 mode에 따라 적절한 UI를 조건부로 렌더링 */}
            {!isFilterReady || !mode ? (
              <motion.div
                key="selection-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center bg-[#1e293b] h-full p-6 sm:p-10 rounded-lg border border-gray-700 shadow-lg min-h-[calc(100vh-8rem)]"
              >
                <div className="flex flex-col items-center mt-30">
                  <Lightbulb className="w-10 h-10 text-blue-400 mb-4 animate-pulse" />
                  <p className="text-base text-gray-300 font-medium leading-relaxed mb-6">
                    {isFilterReady
                      ? "아래에서 모드를 선택하여 시험을 시작하세요!"
                      : "왼쪽 필터에서 시험 정보를 선택하세요."}
                  </p>
                </div>

                {/* 필터가 준비되었을 때만 모드 선택 버튼 표시 */}
                {isFilterReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 justify-center"
                  >
                    <Button
                      onClick={() => setMode("practice")}
                      variant="neutral"
                      size="md"
                      selected={mode === "practice"}
                    >
                      연습 모드
                    </Button>
                    <Button
                      onClick={() => setMode("exam")}
                      variant="neutral"
                      size="md"
                      selected={mode === "exam"}
                    >
                      실전 모드
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : mode === "practice" ? (
              <motion.div
                key="practice-viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* license가 null이 아님을 isFilterReady와 mode 조건으로 보장 */}
                <ProblemViewer
                  year={year}
                  license={license!}
                  level={level}
                  round={round}
                  selectedSubjects={selectedSubjects}
                />
              </motion.div>
            ) : (
              <motion.div
                key="exam-viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* license가 null이 아님을 isFilterReady와 mode 조건으로 보장 */}
                <CbtViewer
                  year={year}
                  license={license!}
                  level={level}
                  round={round}
                  selectedSubjects={selectedSubjects}
                  durationMinutes={125}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
