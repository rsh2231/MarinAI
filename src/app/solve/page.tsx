"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { SUBJECTS_BY_LICENSE } from "@/types/Subjects";

import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/problem/solve/ProblemViewer";
import ExamViewer from "@/components/problem/exam/ExamViewer";
import Button from "@/components/ui/Button";
import question from "@/assets/animations/question.json";

import { useWindowWidth } from "@/hooks/useWindowWidth";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

export default function SolvePage() {
  const [year, setYear] = useState("");
  const [license, setLicense] = useState<
    "항해사" | "기관사" | "소형선박조종사" | null
  >(null);
  const [level, setLevel] = useState("");
  const [round, setRound] = useState("");
  const [mode, setMode] = useState<"practice" | "exam" | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const mainContentRef = useRef<HTMLElement>(null);
  const isMobile = useWindowWidth(768);

  useEffect(() => {
    if (license) {
      const defaultSubjects = SUBJECTS_BY_LICENSE[license] || [];
      setSelectedSubjects(defaultSubjects);
    } else {
      setSelectedSubjects([]);
    }
  }, [license]);

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

  const handleModeSelect = (selectedMode: "practice" | "exam") => {
    setMode(selectedMode);
    if (isMobile) {
      setTimeout(() => {
        mainContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <div className="w-full h-full">
      <Sidebar
        filterState={filterState}
        className="fixed top-0 left-0 z-20 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-700 bg-[#1e293b] pt-20 md:block lg:w-72"
      />
      <main
        ref={mainContentRef}
        className="bg-[#0f172a] h-full overflow-y-auto sm:pt-20 md:pt-20 p-6 md:ml-64 lg:ml-72"
      >
        <AnimatePresence mode="wait">
          {!isFilterReady || !mode ? (
            <motion.div
              key="mode-selection-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mx-auto flex max-w-lg flex-col items-center rounded-lg border border-gray-700 bg-[#1e293b] p-6 text-center shadow-lg sm:p-10"
            >
              <div className="m-8 flex flex-col items-center">
                <Lottie animationData={question} className="h-15 w-15 sm:h-20 sm:w-20 " />
                <p className="mb-6 break-keep text-base font-medium leading-relaxed text-gray-300">
                  {isFilterReady
                    ? "아래에서 모드를 선택하여 시험을 시작하세요!"
                    : isMobile
                    ? "햄버거 버튼을 눌러 시험 정보를 선택하세요."
                    : "사이드바에서 시험 정보를 선택하세요."}
                </p>
              </div>
              {isFilterReady && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center gap-4"
                >
                  <Button onClick={() => handleModeSelect("practice")} variant="neutral" size="md" selected={mode === "practice"}>연습 모드</Button>
                  <Button onClick={() => handleModeSelect("exam")} variant="neutral" size="md" selected={mode === "exam"}>실전 모드</Button>
                </motion.div>
              )}
            </motion.div>
          ) : mode === "practice" ? (
            // ▼▼▼ [핵심 수정 2] mx-auto를 추가하여 스스로 중앙 정렬합니다. ▼▼▼
            <motion.div
              key={`practice-${year}-${license}-${level}-${round}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto h-full max-w-3xl"
            >
              <ProblemViewer year={year} license={license!} level={level} round={round} selectedSubjects={selectedSubjects} />
            </motion.div>
          ) : mode === "exam" ? (
            // ▼▼▼ [핵심 수정 2] mx-auto를 추가하여 스스로 중앙 정렬합니다. ▼▼▼
            <motion.div
              key={`exam-${year}-${license}-${level}-${round}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto h-full max-w-3xl"
            >
              <ExamViewer year={year} license={license!} level={level} round={round} selectedSubjects={selectedSubjects} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
      <ScrollToTopButton scrollableRef={mainContentRef} />
    </div>
  );
}