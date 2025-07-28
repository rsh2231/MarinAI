"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { Question } from "@/types/ProblemViewer";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  question: Question;
  selected?: string;
  showAnswer?: boolean;
  onSelect: (choice: string) => void;
  onToggle?: () => void;
}

export default function QuestionCardComponent({
  question,
  selected,
  showAnswer,
  onSelect,
  onToggle,
}: Props) {
  const { num, questionStr, choices, answer, explanation, imageUrl } = question;
  const isPracticeMode = !!onToggle;

  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleClickOption = (optLabel: string) => {
    if (isPracticeMode && showAnswer) return;
    onSelect(optLabel);
    setFeedback(optLabel === answer ? "correct" : "incorrect");
  };

  return (
    <article
      className={`relative bg-neutral-800/50 border ${
        showAnswer ? "border-neutral-700" : "border-neutral-600"
      } rounded-xl shadow-lg mb-6 p-5 transition-colors`}
    >
      {isPracticeMode && feedback && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none rounded-xl">
          <Lottie
            lottieRef={lottieRef}
            animationData={
              feedback === "correct" ? correctAnimation : incorrectAnimation
            }
            loop={false}
            onDOMLoaded={() => lottieRef.current?.setSpeed(2.5)}
            onComplete={() => setFeedback(null)}
            style={{ width: 192, height: 192 }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 font-medium text-sm sm:text-base break-keep">
        <span className="text-gray-400">문제 {num}</span>
        {questionStr && (
          <p className="whitespace-pre-wrap leading-relaxed text-gray-100">
            {questionStr}
          </p>
        )}
      </div>

      {imageUrl && (
        <div className="my-4 flex justify-center w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={`문제 ${num} 이미지`}
            width={600}
            height={375}
            sizes="(max-width: 640px) 95vw, 600px"
            className="rounded object-contain max-w-full max-h-[50vw] sm:max-w-[600px] sm:max-h-[375px]"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      )}

      <ul className="space-y-3 mt-4 break-keep">
        {choices.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.label === answer;
          const showCorrectStyle = isPracticeMode && showAnswer && isCorrect;
          const isWrong =
            isPracticeMode && isSelected && !isCorrect && showAnswer;

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
              onClick={() => handleClickOption(opt.label)}
            >
              <span className="font-semibold min-w-[24px]">{opt.label}.</span>
              {opt.isImage && opt.imageUrl ? (
                <div className="flex justify-center overflow-hidden">
                  <Image
                    src={opt.imageUrl}
                    alt={`보기 ${opt.label}`}
                    width={400}
                    height={250}
                    sizes="(max-width: 640px) 85vw, 400px"
                    className="rounded object-contain max-w-[85vw] sm:max-w-[400px] max-h-[50vw] sm:max-h-[250px]"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              ) : (
                <span className="text-gray-100">{opt.text}</span>
              )}
            </li>
          );
        })}
      </ul>

      {isPracticeMode && (
        <>
          <button
            onClick={onToggle}
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
                      {explanation ? (
                        <p>{explanation}</p>
                      ) : (
                        <p>해설 정보가 없습니다.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </article>
  );
}
