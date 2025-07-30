"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import QuestionCard from "@/components/problem/UI/QuestionCard";
import { Question } from "@/types/ProblemViewer";
import Button from "@/components/ui/Button";

// 이미지 코드와 앞뒤 공백/개행을 함께 찾는 정규식
const imageCodeWithWhitespaceRegex = /\s*(@pic[\w_-]+)\s*/i;

const findImagePath = (code: string, paths: string[]): string | undefined => {
  const key = code.replace("@", "").trim().toLowerCase();
  const partialMatch = paths.find((p) => {
    const fileName = p.toLowerCase();
    return fileName.includes(key);
  });
  
  if (partialMatch) {
    return partialMatch;
  }
  
  return undefined;
};

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

export default function RetryWrongNoteModal({
  isOpen,
  onClose,
  wrongNotes,
}: {
  isOpen: boolean;
  onClose: () => void;
  wrongNotes: unknown[];
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
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
  const note = wrongNotes[current] as unknown;
  const q = (typeof note === 'object' && note !== null && 'gichul_qna' in note)
    ? (note as { gichul_qna: unknown })['gichul_qna']
    : undefined;

  if (!q || typeof q !== 'object' || q === null) {
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
  const qObj = q as {
    ex1str?: string;
    ex2str?: string;
    ex3str?: string;
    ex4str?: string;
    ex5str?: string;
    ex6str?: string;
    id?: string | number;
    qnum?: string | number;
    questionstr?: string;
    answer?: string;
    explanation?: string;
    subject?: string;
    imgPaths?: string[];
    gichulset?: { type?: string; grade?: string; inning?: number; year?: number };
  };
  // 문제 본문에서 이미지 처리
  let questionStr = qObj.questionstr ?? "";
  let questionImagePath: string | undefined;

  const questionImageMatch = questionStr.match(imageCodeWithWhitespaceRegex);
  if (questionImageMatch && qObj.imgPaths) {
    const matchedString = questionImageMatch[0];
    const code = questionImageMatch[1];

    const foundPath = findImagePath(code, qObj.imgPaths);
    if (foundPath) {
      questionImagePath = foundPath;
      questionStr = questionStr.replace(matchedString, "").trim();
    }
  }

  const choices = [
    { label: "가", text: qObj.ex1str ?? "", isImage: false },
    { label: "나", text: qObj.ex2str ?? "", isImage: false },
    { label: "사", text: qObj.ex3str ?? "", isImage: false },
    { label: "아", text: qObj.ex4str ?? "", isImage: false },
    ...(qObj.ex5str ? [{ label: "마", text: qObj.ex5str ?? "", isImage: false }] : []),
    ...(qObj.ex6str ? [{ label: "바", text: qObj.ex6str ?? "", isImage: false }] : []),
  ].map((choice) => {
    let choiceText = choice.text;
    let choiceImagePath: string | undefined;

    const choiceImageMatch = choice.text.match(imageCodeWithWhitespaceRegex);
    if (choiceImageMatch && qObj.imgPaths) {
      const matchedString = choiceImageMatch[0];
      const code = choiceImageMatch[1];
      
      const foundPath = findImagePath(code, qObj.imgPaths);
      if (foundPath) {
        choiceImagePath = foundPath;
        choiceText = choiceText.replace(matchedString, "").trim();
      }
    }
    
    return {
      ...choice,
      isImage: !!choiceImagePath,
      text: choiceText,
      imageUrl: choiceImagePath
        ? `/api/solve/img/${choiceImagePath}`
        : undefined,
    };
  });

  const question: Question = {
    id: qObj.id !== undefined ? Number(qObj.id) : 0,
    num: qObj.qnum !== undefined ? Number(qObj.qnum) : 0,
    questionStr,
    choices,
    answer: qObj.answer ?? "",
    explanation: qObj.explanation ?? "",
    subjectName: qObj.subject ?? "",
    isImageQuestion: !!questionImagePath,
    imageUrl: questionImagePath
      ? `/api/solve/img/${questionImagePath}`
      : undefined,
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

            {/* 문항 수 표시 */}
            <div className="flex justify-center items-center mb-4">
              <div className="bg-neutral-700/50 border border-neutral-600 rounded-full px-4 py-2 text-sm font-medium text-neutral-300">
                {current + 1} / {wrongNotes.length}
              </div>
            </div>

            {/* 문제 정보 표시 */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {qObj.subject} - 문제{qObj.qnum}
              </h3>
              {/* 배지 정보 */}
              <div className="flex justify-center items-center gap-1.5 flex-wrap">
                {/* 연도 */}
                {qObj.gichulset?.year && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-purple-500/30 hover:to-purple-600/30`}>
                    {qObj.gichulset.year}년
                  </span>
                )}
                {/* 자격증 */}
                {qObj.gichulset?.type && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-blue-500/30 hover:to-blue-600/30`}>
                    {qObj.gichulset.type}
                  </span>
                )}
                {/* 급수 */}
                {qObj.gichulset?.grade && qObj.gichulset.type !== "소형선박조종사" && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-green-500/30 hover:to-green-600/30`}>
                    {qObj.gichulset.grade}급
                  </span>
                )}
                {/* 회차 */}
                {qObj.gichulset?.inning && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-orange-500/30 hover:to-orange-600/30`}>
                    {qObj.gichulset.inning}회차
                  </span>
                )}
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
              className="flex justify-center items-center gap-4 mt-6 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="neutral"
                className="px-4 py-2 rounded bg-secondary text-white disabled:opacity-50"
                onClick={() => handleMove(current - 1)}
                disabled={current === 0}
              >
                이전 문제
              </Button>
              <Button
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
                onClick={() => handleMove(current + 1)}
                disabled={current === wrongNotes.length - 1}
              >
                다음 문제
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
