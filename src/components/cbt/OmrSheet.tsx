import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { X } from "lucide-react";

// Jotai Atoms
import { groupedQuestionsAtom, answersAtom, currentQuestionIndexAtom, isOmrVisibleAtom } from "@/atoms/cbtAtoms";

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
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [currentIdx]);

  let questionIndexOffset = 0;

  return (
    <>
      <AnimatePresence>
        {isVisible && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      </AnimatePresence>
      <motion.aside
        className="fixed top-0 left-0 h-full w-64 bg-[#1e293b] border border-gray-700 flex-col z-50 lg:sticky lg:flex lg:rounded-lg"
        initial={{ x: '-100%' }}
        animate={{ x: isVisible || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between shrink-0">
          <h3 className="font-semibold">문제 목록</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-700 lg:hidden"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {groupedQuestions.map((group) => {
            const subjectTitle = group.subjectName.replace(/^\d+\.\s*/, '');
            const groupStartIndex = questionIndexOffset;
            
            const renderedGroup = (
              <div key={group.subjectName} className="mb-4">
                <h4 className="font-semibold text-sm text-blue-300 mb-2 pt-2 border-t border-gray-700/50 first-of-type:border-t-0 first-of-type:pt-0">
                  {subjectTitle}
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 content-start">
                  {group.questions.map((q, localIndex) => {
                    const globalIndex = groupStartIndex + localIndex;
                    const isCurrent = globalIndex === currentIdx;
                    const isAnswered = answers[q.num] !== undefined;
                    let bgClass = isAnswered ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700';
                    if (isCurrent) bgClass = 'bg-blue-600 ring-2 ring-blue-400';

                    return (
                      <button
                        key={`${q.num}-${globalIndex}`}
                        ref={(el) => { omrItemRefs.current[globalIndex] = el; }}
                        onClick={() => { onSelectQuestion(globalIndex); onClose(); }}
                        className={`flex items-center justify-center h-10 w-10 rounded-md font-mono text-sm transition-colors ${bgClass}`}
                      >
                        {globalIndex + 1}
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