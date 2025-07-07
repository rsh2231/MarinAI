"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { Question } from "@/types/ProblemViwer";
import { extractImageCode } from "@/utils/problemUtils";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";

interface Props {
  question: Question;
  selected?: string;
  showAnswer?: boolean;
  onSelect: (choice: string) => void;
  onToggle?: () => void;
  license: string;
  code: string;
}

function isImageCode(str: string) {
  return /^@pic/.test(str.trim());
}

function QuestionCardComponent({
  question,
  selected,
  showAnswer,
  onSelect,
  onToggle,
  license,
  code,
}: Props) {
  const correctAnswer = question.answer;
  const options = [
    { label: "가", value: question.ex1Str },
    { label: "나", value: question.ex2Str },
    { label: "사", value: question.ex3Str },
    { label: "아", value: question.ex4Str },
  ];
  const correctOption = options.find((opt) => opt.label === correctAnswer);
  const correctText = correctOption ? correctOption.value : "";

  const { textWithoutImage, imageCode } = extractImageCode(
    question.questionsStr
  );
  const finalImageCode = question.image ?? imageCode;
  const hasImage = !!finalImageCode?.trim();
  const imagePath = hasImage
    ? `/data/${license}/${code}/${code}-${finalImageCode}.png`
    : null;

  const isPracticeMode = !!onToggle;

  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (feedback && lottieRef.current) {
      requestAnimationFrame(() => {
        lottieRef.current?.setSpeed(2.5);
      });

      const timer = setTimeout(() => setFeedback(null), 600);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleClickOption = (optLabel: string) => {
    if (isPracticeMode && showAnswer) return;
    onSelect(optLabel);
    const isCorrect = optLabel === correctAnswer;
    setFeedback(isCorrect ? "correct" : "incorrect");
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className={`relative bg-background-dark border ${
        isPracticeMode && showAnswer ? "border-gray-600" : "border-white"
      } rounded-xl shadow-card mb-6 p-5 transition-colors`}
    >
      {/* Lottie 애니메이션 조건부 렌더링 */}
      {isPracticeMode && feedback && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none rounded-xl">
          <div className="w-40 h-40 sm:w-48 sm:h-48">
            <Lottie
              lottieRef={lottieRef}
              animationData={
                feedback === "correct" ? correctAnimation : incorrectAnimation
              }
              loop={false}
            />
          </div>
        </div>
      )}

      {/* 문제 텍스트 */}
      <div className="flex flex-col gap-2 font-medium text-sm sm:text-base">
        <span className="text-gray-400 text-xs sm:text-sm">
          문제 {question.num}
        </span>
        <p className="whitespace-pre-wrap leading-relaxed">
          {textWithoutImage}
        </p>
      </div>

      {/* 문제 이미지 */}
      {hasImage && imagePath && (
        <div className="my-4 flex justify-center">
          <Image
            src={imagePath}
            alt={`문제 ${question.num} 이미지`}
            width={0}
            height={0}
            sizes="100vw"
            priority
            className="rounded border border-gray-600 w-full sm:w-auto max-w-full sm:max-w-[80%] h-auto max-h-[300px] sm:max-h-[400px] object-contain"
          />
        </div>
      )}

      {/* 보기 */}
      <ul className="space-y-3 mt-4">
        {options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.label === correctAnswer;

          const showCorrectStyle = isPracticeMode && showAnswer && isCorrect;
          const isWrong =
            isPracticeMode && isSelected && !isCorrect && showAnswer;

          const base =
            "flex items-center gap-3 px-4 py-3 rounded-md border text-sm cursor-pointer transition-all";
          const selectedCls = isSelected
            ? "border-primary bg-black/50"
            : "border-gray-700 hover:bg-gray-800/30";
          const correctCls = showCorrectStyle
            ? "border-green-500 bg-green-900/20 text-green-300"
            : "";
          const wrongCls = isWrong
            ? "border-red-500 bg-red-900/20 text-red-300"
            : "";

          return (
            <li
              key={opt.label}
              className={`${base} ${selectedCls} ${correctCls} ${wrongCls}`}
              onClick={() => handleClickOption(opt.label)}
            >
              <span className="font-semibold text-sm sm:text-base min-w-[24px]">
                {opt.label}.
              </span>
              {isImageCode(opt.value) ? (
                <div className="w-full flex justify-start">
                  <Image
                    key={opt.value}
                    src={`/data/${license}/${code}/${code}-${opt.value
                      .trim()
                      .slice(1)}.png`}
                    alt={`보기 ${opt.label}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    priority
                    className="h-auto w-full sm:w-auto max-w-full sm:max-w-[80%] max-h-[200px] sm:max-h-[300px] object-contain border border-gray-600 rounded"
                  />
                </div>
              ) : (
                <span className="text-gray-100 text-sm sm:text-base">
                  {opt.value}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* 해설 보기 */}
      {isPracticeMode && (
        <>
          <button
            onClick={onToggle}
            className="mt-5 text-sm text-blue-400 hover:underline"
            type="button"
          >
            {showAnswer ? "해설 숨기기" : "해설 보기"}
          </button>
          {showAnswer && (
            <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
              <p className="flex flex-wrap items-start gap-x-2 gap-y-1">
                <span className="shrink-0">✅</span>
                <span className="shrink-0 font-semibold">정답:</span>
                <span>
                  {correctAnswer}. {correctText}
                </span>
              </p>

              {question.explanation && (
                <p className="mt-2 flex flex-wrap items-start gap-x-2 gap-y-1 text-gray-400">
                  <span className="shrink-0 flex items-center gap-1">
                    💡 <strong>해설:</strong>
                  </span>
                  <span className="min-w-0">{question.explanation}</span>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </motion.article>
  );
}

export default React.memo(
  QuestionCardComponent,
  (prev, next) =>
    prev.selected === next.selected &&
    prev.showAnswer === next.showAnswer &&
    prev.question.num === next.question.num
);
