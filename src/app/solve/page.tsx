"use client";

import { Suspense } from "react";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { isOmrVisibleAtom, showResultAtom } from "@/atoms/examAtoms";

import { useSolveLogic } from "@/hooks/useSolveLogic";
import { useIsMobile } from "@/hooks/useIsMobile";

import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/problem/practice/PracticeViewer";
import ExamContainer from "@/components/problem/exam/ExamContainer";
import ModeSelectionPrompt from "@/components/solve/ModeSelectionPrompt";
import { OmrSheet } from "@/components/problem/UI/OmrSheet";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

export default function SolvePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SolvePageContent />
    </Suspense>
  );
}

function SolvePageContent() {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  // 커스텀 훅에서 모든 로직과 상태를 가져옴
  const {
    year, license, level, round, mode, selectedSubjects,
    isFilterReady, filterState, handleModeSelect,
  } = useSolveLogic();

  const isOmrVisible = useAtomValue(isOmrVisibleAtom);
  const showResult = useAtomValue(showResultAtom);

  // 모드 선택 시 모바일에서 스크롤하는 로직
  const onModeSelect = (selectedMode: "practice" | "exam") => {
    handleModeSelect(selectedMode);
    if (isMobile) {
      setTimeout(() => {
        mainContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // 렌더링할 컨텐츠를 결정하는 함수 (가독성 향상)
  const renderContent = () => {
    if (!isFilterReady || !mode) {
      return <ModeSelectionPrompt isFilterReady={isFilterReady} onModeSelect={onModeSelect} />;
    }
    
    switch (mode) {
      case "practice":
        return (
          <motion.div
            key={`practice-${year}-${license}-${level}-${round}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-3xl p-6"
          >
            <ProblemViewer {...{ year, license: license!, level, round, selectedSubjects }} />
          </motion.div>
        );
      case "exam":
        return (
          <motion.div
            key={`exam-${year}-${license}-${level}-${round}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={showResult ? "min-h-screen" : "h-full"}
          >
            <ExamContainer {...{ year, license: license!, level, round, selectedSubjects, scrollRef: mainContentRef }} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${showResult ? "min-h-screen" : "h-full"}`}>
      {!showResult && (
        <>
          <Sidebar
            filterState={filterState}
            className="fixed top-0 left-0 z-20 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-700 bg-[#1e293b] pt-20 md:block lg:w-72"
          />
          {mode === "exam" && <OmrSheet />}
        </>
      )}

      <main
        ref={mainContentRef}
        className={`bg-[#0f172a] transition-all duration-300
           ${showResult ? "min-h-screen" : "h-full"}
           ${mode === "practice" ? "overflow-y-auto" : ""} 
           ${!showResult ? "md:ml-64 lg:ml-72" : ""}
           ${isOmrVisible && mode === "exam" && !showResult ? "lg:mr-72" : ""}`}
      >
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
      
      <ScrollToTopButton
        className="fixed bottom-6 right-6 lg:right-15 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
        scrollableRef={mainContentRef}
      />
    </div>
  );
}