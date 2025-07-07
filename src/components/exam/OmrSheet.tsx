"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { X } from "lucide-react";

import {
  allQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  isOmrVisibleAtom,
} from "@/atoms/examAtoms";
import { QuestionWithSubject } from "@/types/ProblemViwer"; 

export const OmrSheet: React.FC = () => {
  const [allQuestions] = useAtom(allQuestionsAtom);
  const [answers] = useAtom(answersAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [isVisible, setIsVisible] = useAtom(isOmrVisibleAtom);

  const omrItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 창 크기 변경에 반응하는 useEffect
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsVisible(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsVisible]);

  useEffect(() => {
    if (isVisible) {
      // 사이드바가 열리는 애니메이션 시간을 기다린 후 스크롤
      setTimeout(() => {
        omrItemRefs.current[currentIdx]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [currentIdx, isVisible]);

  const onClose = () => setIsVisible(false);

  const onSelectQuestion = (index: number) => {
    setCurrentIdx(index);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // 과목별 그룹핑
  const groupedBySubject = allQuestions.reduce((acc, q) => {
    (acc[q.subjectName] = acc[q.subjectName] || []).push(q);
    return acc;
  }, {} as Record<string, QuestionWithSubject[]>);

  // 루프 외부에서 offset 변수 선언
  let questionIndexOffset = 0;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-0 right-0 h-screen w-[90vw] max-w-[280px] bg-[#1e293b] border-l border-gray-700 z-50 flex flex-col lg:w-64 lg:max-w-none lg:translate-x-0"
        initial={{ x: "100%" }}
        animate={{ x: isVisible ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-sm">문제 목록</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-700 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
          {Object.entries(groupedBySubject).map(([subjectName, questions]) => {
            const groupStartIndex = questionIndexOffset;
            const renderedGroup = (
              <div key={subjectName}>
                <h4 className="font-semibold text-xs text-blue-300 mb-2 border-b border-gray-700 pb-1">
                  {subjectName.replace(/^[0-9]+\.\s*/, "")}
                </h4>
                <div className="grid grid-cols-5 gap-1">
                  {questions.map((q, localIndex) => {
                    const globalIndex = groupStartIndex + localIndex;
                    const isCurrent = globalIndex === currentIdx;
                    const key = `${q.subjectName}-${q.num}`;
                    const isAnswered = answers[key] !== undefined;

                    let bgClass = isAnswered
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-gray-800 hover:bg-gray-700";
                    if (isCurrent) bgClass = "bg-blue-600 ring-2 ring-blue-400";

                    return (
                      <button
                        key={key}
                        ref={(el) => { omrItemRefs.current[globalIndex] = el; }}
                        onClick={() => onSelectQuestion(globalIndex)}
                        className={`h-8 w-8 text-xs font-mono rounded flex items-center justify-center transition-colors ${bgClass}`}
                      >
                        {q.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
            // 다음 그룹을 위해 offset 업데이트
            questionIndexOffset += questions.length;
            return renderedGroup;
          })}
        </div>
      </motion.aside>
    </>
  );
};