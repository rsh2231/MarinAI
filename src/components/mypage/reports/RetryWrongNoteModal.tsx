"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import Image from "next/image";

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const CHOICE_LABELS = ["가", "나", "사", "아"];

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
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleClose = () => {
    setSelected(null);
    setCurrent(0);
    setShowAnswer(false);
    setFeedback(null);
    onClose();
  };

  if (!wrongNotes || wrongNotes.length === 0) {
    return null;
  }

  const note = wrongNotes[current];
  const q = note.gichul_qna;
  const imageUrl = q.imgPaths && q.imgPaths.length > 0 ? q.imgPaths[0] : undefined;

  const choices = [
    { label: "가", text: q.ex1str, isImage: false },
    { label: "나", text: q.ex2str, isImage: false },
    { label: "사", text: q.ex3str, isImage: false },
    { label: "아", text: q.ex4str, isImage: false },
    ...(q.ex5str ? [{ label: "마", text: q.ex5str, isImage: false }] : []),
    ...(q.ex6str ? [{ label: "바", text: q.ex6str, isImage: false }] : []),
  ];

  const handleSelect = (label: string) => {
    setSelected(label);
    setFeedback(label === q.answer ? "correct" : "incorrect");
  };

  // 다음/이전 문제 이동 시 상태 초기화
  const handleMove = (next: number) => {
    setCurrent(next);
    setSelected(null);
    setShowAnswer(false);
    setFeedback(null);
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

            <div className="flex flex-col gap-2 font-medium text-sm sm:text-base break-keep">
              <span className="text-gray-400">문제 {q.qnum}</span>
              {q.questionstr && (
                <p className="whitespace-pre-wrap leading-relaxed text-gray-100 text-center">{q.questionstr}</p>
              )}
            </div>

            {imageUrl && (
              <div className="my-4 flex justify-center w-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`문제 ${q.qnum} 이미지`}
                  width={400}
                  height={250}
                  sizes="(max-width: 640px) 90vw, 400px"
                  className="rounded object-contain w-full h-auto max-w-full max-h-[40vw] sm:max-w-[400px] sm:max-h-[250px]"
                  priority
                />
              </div>
            )}

            <ul className="space-y-3 mt-4 break-keep">
              {choices.map((opt) => {
                const isSelected = selected === opt.label;
                const isCorrect = opt.label === q.answer;
                const showCorrectStyle = showAnswer && isCorrect;
                const isWrong = isSelected && !isCorrect && showAnswer;

                const base =
                  "flex items-center gap-3 px-4 py-3 rounded-md border cursor-pointer transition-all text-sm sm:text-base";
                const selectedCls = isSelected
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-neutral-700 hover:bg-neutral-700/50";
                const correctCls = showCorrectStyle
                  ? "!border-green-500 !bg-green-900/30 !text-green-300"
                  : "";
                const wrongCls = isWrong
                  ? "!border-red-500 !bg-red-900/30 !text-red-300"
                  : "";

                return (
                  <li
                    key={opt.label}
                    className={`${base} ${selectedCls} ${correctCls} ${wrongCls}`}
                    onClick={() => handleSelect(opt.label)}
                  >
                    <span className="font-semibold min-w-[24px]">{opt.label}.</span>
                    <span className="text-gray-100">{opt.text}</span>
                  </li>
                );
              })}
            </ul>

            {/* 해설 보기 */}
            <button
              onClick={() => setShowAnswer((v) => !v)}
              className="mt-5 text-sm text-blue-400 hover:underline"
              type="button"
            >
              {showAnswer ? "▲ 해설 숨기기" : "▼ 해설 보기"}
            </button>

            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  layout
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden mt-3 text-sm break-keep"
                >
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed break-words pt-3 border-t border-neutral-700">
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2 text-gray-300">
                        <strong>💡 해설</strong>
                      </div>
                      <div className="pl-6 border-l-2 border-neutral-600 text-gray-200">
                        {q.explanation ? <p>{q.explanation}</p> : <p>해설 정보가 없습니다.</p>}
                      </div>
                      <div className="mt-2 text-green-600 font-bold">
                        정답: {q.answer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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