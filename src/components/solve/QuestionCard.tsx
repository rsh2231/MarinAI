"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { useSolveProblem } from "@/hooks/useSolveProblem";
import { Question } from "@/types/ProblemViwer";
import { extractImageCode } from "@/utils/problemUtils";
import correctAnimation from "@/assets/animations/correct.json";
import incorrectAnimation from "@/assets/animations/incorrect.json";
import Loading from "@/assets/animations/loading.json";
import Fail from "@/assets/animations/fail.json";

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

  const { result, loading, error, solve } = useSolveProblem();

  useEffect(() => {
    if (
      isPracticeMode &&
      showAnswer &&
      !question.explanation &&
      !result &&
      !loading
    ) {
      const prompt = `문제 ${question.num}\n${question.questionsStr}\n\n보기:\n가. ${question.ex1Str}\n나. ${question.ex2Str}\n사. ${question.ex3Str}\n아. ${question.ex4Str}\n\n정답: ${correctAnswer}`;
      solve(prompt);
    }
  }, [
    question.num,
    showAnswer,
    result,
    loading,
    isPracticeMode,
    question.explanation,
  ]);

  return (
    <motion.article
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
      <div className="flex flex-col gap-2 font-medium text-sm sm:text-base break-keep">
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
      <ul className="space-y-3 mt-4 break-keep">
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
            {showAnswer ? "▲ 해설 숨기기" : "▼ 해설 보기"}
          </button>
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                key="explanation"
                layout
                layoutRoot
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mt-3 text-sm "
              >
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
                  {/* 정답 표시 부분 */}
                  {/* <p className="flex flex-wrap items-start gap-x-2 gap-y-1">
                        <span className="shrink-0">✅</span>
                        <span className="shrink-0 font-semibold">정답 :</span>
                        <span>
                          {correctAnswer}. {correctText}
                        </span>
                      </p> */}
        
                  <div className="mt-2">
                    {/* 1. "해설" 제목 부분 */}
                    <div className="flex items-center gap-2 mb-2 text-gray-300">
                      <span className="shrink-0">💡</span>
                      <strong>해설</strong>
                    </div>

                    {/* 2. 콘텐츠 부분 (들여쓰기 효과를 위해 pl-6 추가) */}
                    <div className="pl-6 border-l-2 border-gray-700">
                      {question.explanation ? (
                        <p>{question.explanation}</p>
                      ) : loading && !result ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Lottie animationData={Loading} className="w-20 h-20" />
                        </div>
                      ) : error ? (
                        <div className="flex items-center gap-2 text-red-500">
                          <span>해설을 가져오는 데 실패했습니다.</span>
                          <Lottie animationData={Fail} className="w-5 h-5" />
                        </div>
                      ) : (
                        <p>{result}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.article>
  );
}

export default QuestionCardComponent;
