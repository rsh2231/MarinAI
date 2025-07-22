"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { X } from "lucide-react";

import {
  isOmrVisibleAtom,
  allQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
} from "@/atoms/examAtoms";
import { Question } from "@/types/ProblemViewer";

interface OmrSheetProps {
  onSelectQuestion: (question: Question, index: number) => void;
}

export const OmrSheet: React.FC<OmrSheetProps> = ({ onSelectQuestion }) => {
  const allQuestions = useAtomValue(allQuestionsAtom);
  const answers = useAtomValue(answersAtom);
  const currentIdx = useAtomValue(currentQuestionIndexAtom);
  const [isVisible, setIsVisible] = useAtom(isOmrVisibleAtom);

  const omrItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
    if (isVisible && currentIdx >= 0 && omrItemRefs.current[currentIdx]) {
      setTimeout(() => {
        omrItemRefs.current[currentIdx]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
    }
  }, [currentIdx, isVisible]);

  const onClose = () => setIsVisible(false);

  const handleItemClick = (question: Question, index: number) => {
    onSelectQuestion(question, index);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const groupedBySubject = allQuestions.reduce((acc, q) => {
    (acc[q.subjectName] = acc[q.subjectName] || []).push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  let questionIndexOffset = 0;

  const HEADER_HEIGHT = 56;

  return (
    <>
      {/* 모바일 오버레이 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 right-0 z-40 lg:hidden bg-black/60"
            style={{
              top: HEADER_HEIGHT,
              height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-[56px] right-0 h-[calc(100vh-56px)] w-[60vw] max-w-72 bg-[#1e293b] border-l border-gray-700 z-50 flex flex-col lg:w-72 lg:shrink-0"
        initial={{ x: "100%" }}
        animate={{ x: isVisible ? 0 : "100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-sm">문제 목록</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
          {Object.keys(groupedBySubject).length > 0 ? (
            Object.entries(groupedBySubject).map(([subjectName, questions]) => {
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
                      if (isCurrent)
                        bgClass = "bg-blue-600 ring-2 ring-blue-400";

                      return (
                        <button
                          key={key}
                          ref={(el) => {
                            if (omrItemRefs.current)
                              omrItemRefs.current[globalIndex] = el;
                          }}
                          onClick={() => handleItemClick(q, globalIndex)}
                          className={`h-8 w-8 text-xs font-mono rounded flex items-center justify-center transition-colors ${bgClass}`}
                        >
                          {q.num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
              questionIndexOffset += questions.length;
              return renderedGroup;
            })
          ) : (
            <p className="text-center text-xs text-gray-500 pt-4">
              문제 데이터가 없습니다.
            </p>
          )}
        </div>
      </motion.aside>
    </>
  );
};
