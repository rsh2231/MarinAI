"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { useSetAtom, useAtomValue } from "jotai";
import {
  isOmrVisibleAtom,
  currentQuestionIndexAtom,
  selectedSubjectAtom,
  showResultAtom,
} from "@/atoms/examAtoms";

import { SUBJECTS_BY_LICENSE } from "@/types/Subjects";
import { Question } from "@/types/ProblemViewer";

import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/problem/practice/PracticeViewer";
import ExamViewer from "@/components/problem/exam/ExamViewer";
import { OmrSheet } from "@/components/problem/exam/OmrSheet";
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
  const mainContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useWindowWidth(768);

  const isOmrVisible = useAtomValue(isOmrVisibleAtom);
  const showResult = useAtomValue(showResultAtom);
  const setShowResult = useSetAtom(showResultAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);

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
    setShowResult(false); // 필터 변경 시 결과 상태 초기화
  }, [year, license, level, round, setShowResult]);

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
    setShowResult(false); // 모드 선택 시 결과 상태 초기화
    if (isMobile) {
      setTimeout(() => {
        mainContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleQuestionSelectFromOMR = (question: Question, index: number) => {
    setCurrentIdx(index);
    setSelectedSubject(question.subjectName);
  };

  const isModeSelection = !isFilterReady || !mode;

  return (
    <div className={`w-full ${showResult ? "min-h-screen" : "h-full"}`}>
      {!showResult && (
        <>
          <Sidebar
            filterState={filterState}
            className="fixed top-0 left-0 z-20 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-700 bg-[#1e293b] pt-20 md:block lg:w-72"
          />
          {mode === "exam" && (
            <OmrSheet onSelectQuestion={handleQuestionSelectFromOMR} />
          )}
        </>
      )}

<main
        ref={mainContentRef}
        className={`bg-[#0f172a] transition-all duration-300
           ${showResult ? "min-h-screen" : "h-full"}
           ${mode === 'practice' ? 'overflow-y-auto' : ''} 
           ${!showResult ? "md:ml-64 lg:ml-72" : ""}
           ${isOmrVisible && mode === "exam" && !showResult ? "lg:mr-72" : ""}`}
      >
        <AnimatePresence mode="wait">
          {isModeSelection ? (
            <motion.div
              key="mode-selection-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center px-6 h-full"
            >
              <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-lg border border-gray-700 bg-[#1e293b] p-6 text-center shadow-lg sm:p-10">
                <div className="m-4 flex flex-col items-center">
                  <Lottie
                    animationData={question}
                    className="h-15 w-15 sm:h-20 sm:w-20 "
                  />
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
                    <Button
                      onClick={() => handleModeSelect("practice")}
                      variant="neutral"
                      size="md"
                      selected={mode === "practice"}
                    >
                      연습 모드
                    </Button>
                    <Button
                      onClick={() => handleModeSelect("exam")}
                      variant="neutral"
                      size="md"
                      selected={mode === "exam"}
                    >
                      실전 모드
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : mode === "practice" ? (
            <motion.div
              key={`practice-${year}-${license}-${level}-${round}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-3xl p-6"
            >
              <ProblemViewer
                year={year}
                license={license!}
                level={level}
                round={round}
                selectedSubjects={selectedSubjects}
              />
            </motion.div>
          ) : mode === "exam" ? (
            <motion.div
              key={`exam-${year}-${license}-${level}-${round}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={showResult ? "min-h-screen" : "h-full"}
            >
              <ExamViewer
                year={year}
                license={license!}
                level={level}
                round={round}
                selectedSubjects={selectedSubjects}
                scrollRef={mainContentRef}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
      <ScrollToTopButton scrollableRef={mainContentRef} />
    </div>
  );
}
