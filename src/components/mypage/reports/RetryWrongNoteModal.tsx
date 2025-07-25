"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import Image from "next/image";
import QuestionCard from "@/components/problem/UI/QuestionCard";
import { Question } from "@/types/ProblemViewer";

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function RetryWrongNoteModal({
  isOpen,
  onClose,
  wrongNotes,
}: {
  isOpen: boolean;
  onClose: () => void;
  wrongNotes: any[];
}) {
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

  if (!wrongNotes || wrongNotes.length === 0) {
    return null;
  }

  // gichul_qna → Question 변환
  const note = wrongNotes[current];
  const q = note.gichul_qna;
  const choices = [
    { label: "가", text: q.ex1str, isImage: false },
    { label: "나", text: q.ex2str, isImage: false },
    { label: "사", text: q.ex3str, isImage: false },
    { label: "아", text: q.ex4str, isImage: false },
    ...(q.ex5str ? [{ label: "마", text: q.ex5str, isImage: false }] : []),
    ...(q.ex6str ? [{ label: "바", text: q.ex6str, isImage: false }] : []),
  ];
  const question: Question = {
    id: q.id,
    num: q.qnum,
    questionStr: q.questionstr,
    choices,
    answer: q.answer,
    explanation: q.explanation,
    subjectName: q.subject,
    isImageQuestion: false,
    imageUrl: q.imgPaths?.[0],
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
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-gray-900/60 flex items-center justify-center px-4 backdrop-blur-sm"
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-neutral-800/50 border border-neutral-700 rounded-xl shadow-lg p-5 w-full max-w-md text-foreground-dark"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-secondary hover:text-foreground-dark transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon />
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
                    animationData={feedback === "correct" ? correctAnimation : incorrectAnimation}
                    loop={false}
                    onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
                    onComplete={() => setFeedback(null)}
                    style={{ width: 192, height: 192 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <QuestionCard
              question={question}
              selected={selected}
              showAnswer={showAnswer}
              onSelect={setSelected}
              onToggle={() => setShowAnswer((v) => !v)}
            />

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 rounded bg-secondary text-white disabled:opacity-50"
                onClick={() => handleMove(current - 1)}
                disabled={current === 0}
              >
                이전 문제
              </button>
              <button
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
                onClick={() => handleMove(current + 1)}
                disabled={current === wrongNotes.length - 1}
              >
                다음 문제
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 