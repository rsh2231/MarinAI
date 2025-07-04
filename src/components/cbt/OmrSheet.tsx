"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { X } from "lucide-react";

import {
  groupedQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  isOmrVisibleAtom,
} from "@/atoms/cbtAtoms";

export const OmrSheet: React.FC = () => {
  const [groupedQuestions] = useAtom(groupedQuestionsAtom);
  const [answers] = useAtom(answersAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [isVisible, setIsVisible] = useAtom(isOmrVisibleAtom);

  const omrItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onClose = () => setIsVisible(false);
  const onSelectQuestion = (index: number) => setCurrentIdx(index);

  useEffect(() => {
    omrItemRefs.current[currentIdx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [currentIdx]);

  let questionIndexOffset = 0;

  return (
    <>
      {/* 모바일 배경 오버레이 */}
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

      {/* OMR 시트 본체 */}
      <motion.aside
        className="fixed top-0 right-0 h-full w-[90vw] max-w-[280px] bg-[#1e293b] border-l border-gray-700 z-50 flex flex-col lg:w-64 lg:max-w-none overflow-auto"
        initial={{ x: "100%" }}
        animate={{
          x:
            isVisible ||
            (typeof window !== "undefined" && window.innerWidth >= 1024)
              ? 0
              : "100%",
        }}
        transition={{ type: "tween", duration: 0.3 }}
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
          {groupedQuestions.map((group) => {
            const subjectTitle = group.subjectName.replace(/^\d+\.\s*/, "");
            const groupStartIndex = questionIndexOffset;

            const renderedGroup = (
              <div key={group.subjectName}>
                <h4 className="font-semibold text-xs text-blue-300 mb-2 border-b border-gray-700 pb-1">
                  {subjectTitle}
                </h4>
                <div className="grid grid-cols-5 gap-1">
                  {group.questions.map((q, localIndex) => {
                    const globalIndex = groupStartIndex + localIndex;
                    const isCurrent = globalIndex === currentIdx;
                    const key = `${subjectTitle}-${q.num}`;
                    const isAnswered = answers[key] !== undefined;
                    let bgClass = isAnswered
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-gray-800 hover:bg-gray-700";
                    if (isCurrent) bgClass = "bg-blue-600 ring-2 ring-blue-400";

                    return (
                      <button
                        key={`${q.num}-${globalIndex}`}
                        ref={(el) => {
                          omrItemRefs.current[globalIndex] = el;
                        }}
                        onClick={() => {
                          onSelectQuestion(globalIndex);
                          onClose();
                        }}
                        className={`h-8 w-8 text-xs font-mono rounded flex items-center justify-center transition-colors ${bgClass}`}
                      >
                        {q.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
            questionIndexOffset += group.questions.length;
            return renderedGroup;
          })}
        </div>
      </motion.aside>
    </>
  );
};
