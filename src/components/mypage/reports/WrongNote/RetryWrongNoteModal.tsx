"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import QuestionCard from "@/components/problem/UI/QuestionCard";
import { Question } from "@/types/ProblemViewer";
import Button from "@/components/ui/Button";
import { RetryModalProps } from "./types";
import { WrongNoteBadges } from "./components/WrongNoteBadges";
import { useWrongNoteData } from "./hooks/useWrongNoteData";

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function RetryWrongNoteModal({ isOpen, onClose, wrongNotes }: RetryModalProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleClose = () => {
    setSelected(undefined);
    setCurrent(0);
    setShowAnswer(false);
    setFeedback(null);
    onClose();
  };

  const { processWrongNote } = useWrongNoteData(wrongNotes || [], { subject: "", license: "", grade: "" });

  if (!wrongNotes || wrongNotes.length === 0) {
    return null;
  }

  const currentNote = wrongNotes[current];
  const processedNote = processWrongNote(currentNote);

  if (!processedNote) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center px-4 backdrop-blur-md"
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-neutral-800/50 border border-neutral-700 rounded-xl shadow-lg p-5 w-full max-w-md max-h-[90vh] text-foreground-dark overflow-hidden flex flex-col"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-700/80 hover:bg-neutral-600/90 text-neutral-300 hover:text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-neutral-600/50 hover:border-neutral-500/70 z-10 group"
                aria-label="Close modal"
              >
                <CloseIcon />
                <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
              <div className="p-4 text-center text-neutral-400">
                문제 정보를 불러올 수 없습니다.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const question: Question = {
    id: processedNote.id,
    num: processedNote.metadata.qnum || processedNote.id,
    questionStr: processedNote.questionStr,
    choices: processedNote.choices,
    answer: processedNote.answer,
    explanation: processedNote.explanation,
    subjectName: processedNote.subjectName,
    isImageQuestion: processedNote.isImageQuestion,
    imageUrl: processedNote.imageUrl,
  };

  // 문제 이동 시 상태 초기화
  const handleMove = (next: number) => {
    setCurrent(next);
    setSelected(undefined);
    setShowAnswer(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center px-4 backdrop-blur-md"
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-neutral-800/50 border border-neutral-700 rounded-xl shadow-lg p-5 w-full max-w-md max-h-[90vh] text-foreground-dark overflow-hidden flex flex-col"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-700/80 hover:bg-neutral-600/90 text-neutral-300 hover:text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-neutral-600/50 hover:border-neutral-500/70 z-10 group"
              aria-label="Close modal"
            >
              <CloseIcon />
              <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>

            {/* Lottie 애니메이션 */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={
                      feedback === "correct"
                        ? correctAnimation
                        : incorrectAnimation
                    }
                    loop={false}
                    onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
                    onComplete={() => setFeedback(null)}
                    style={{ width: 192, height: 192 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 문제 정보 표시 */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {processedNote.subjectName} - 문제{processedNote.metadata.qnum}
              </h3>
              {/* 배지 정보 */}
              <div className="flex justify-center items-center gap-1.5 flex-wrap">
                <WrongNoteBadges
                  year={processedNote.metadata.year}
                  type={processedNote.metadata.type}
                  grade={processedNote.metadata.grade}
                  inning={processedNote.metadata.inning}
                />
              </div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto"
            >
              <QuestionCard
                question={question}
                selected={selected}
                showAnswer={showAnswer}
                onSelect={setSelected}
                onToggle={() => setShowAnswer((v) => !v)}
                hideNumber={true}
              />
            </div>

            <div
              className="flex justify-center items-center gap-4 mt-6 flex-shrink-0 sm:flex-row sm:justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => handleMove(current - 1)}
                disabled={current === 0}
                variant="neutral"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전 문제
              </Button>

              <span className="text-gray-400 text-sm">
                {current + 1} / {wrongNotes.length}
              </span>

              <Button
                onClick={() => handleMove(current + 1)}
                disabled={current === wrongNotes.length - 1}
                className="flex items-center gap-2"
              >
                다음 문제
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
