"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { Question } from "@/types/ProblemViwer";
import { extractImageCode } from "@/utils/problemUtils";

interface Props {
  question: Question;
  selected?: string;
  showAnswer?: boolean;
  onSelect: (choice: string) => void;
  onToggle: () => void;
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

  const { textWithoutImage, imageCode } = extractImageCode(question.questionsStr);
  const finalImageCode = question.image ?? imageCode;
  const hasImage = !!finalImageCode?.trim();
  const imagePath = hasImage
    ? `/data/${license}/${code}/${code}-${finalImageCode}.png`
    : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="bg-background-dark border border-white rounded-xl shadow-card mb-6 p-5 transition-colors"
    >
      {/* 문제 텍스트 */}
      <div className="mb-4 text-gray-100">
        <div className="flex flex-col gap-2 font-medium text-base sm:text-lg">
          <span className="text-gray-400 text-sm sm:text-base">문제 {question.num}</span>
          <p className="whitespace-pre-wrap leading-relaxed">{textWithoutImage}</p>
        </div>
      </div>

      {/* 문제 이미지 */}
      {hasImage && imagePath && (
        <div className="mb-4 flex justify-center">
          <Image
            src={imagePath}
            alt={`문제 ${question.num} 이미지`}
            width={0}
            height={0}
            sizes="100vw"
            priority
            key={imagePath} // 깜빡임 방지
            className="rounded border border-gray-600 w-auto h-auto max-h-[300px] max-w-full object-contain"
          />
        </div>
      )}

      {/* 보기 영역 */}
      <ul className="space-y-3 mt-4">
        {options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.label === correctAnswer;
          const isWrong = isSelected && !isCorrect && showAnswer;

          const base =
            "flex items-center gap-3 px-4 py-3 rounded-md border text-sm cursor-pointer transition-all";
          const selectedCls = isSelected
            ? "border-primary bg-primary/10"
            : "border-gray-700 hover:bg-gray-800/30";
          const correctCls =
            showAnswer && isCorrect
              ? "border-green-500 bg-green-900/20 text-green-300"
              : "";
          const wrongCls =
            showAnswer && isWrong
              ? "border-red-500 bg-red-900/20 text-red-300"
              : "";

          return (
            <li
              key={opt.label}
              className={`${base} ${selectedCls} ${correctCls} ${wrongCls}`}
              onClick={() => onSelect(opt.label)}
            >
              <span className="font-semibold text-base min-w-[24px]">
                {opt.label}.
              </span>
              {isImageCode(opt.value) ? (
                <div className="w-full flex justify-start">
                  <Image
                    key={opt.value} // 깜빡임 방지
                    src={`/data/${license}/${code}/${code}-${opt.value.trim().slice(1)}.png`}
                    alt={`보기 ${opt.label}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    priority
                    className="h-auto w-auto max-h-[200px] max-w-full object-contain border border-gray-600 rounded"
                  />
                </div>
              ) : (
                <span className="text-gray-100 text-base">{opt.value}</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* 해설 보기 버튼 */}
      <button
        onClick={onToggle}
        className="mt-5 text-sm text-blue-400 hover:underline"
        type="button"
      >
        {showAnswer ? "해설 숨기기" : "해설 보기"}
      </button>

      {/* 해설 내용 */}
      {showAnswer && (
        <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          ✅ <strong>정답:</strong> {correctAnswer}. {correctText}
          {question.explanation && (
            <p className="mt-2 text-gray-400">
              💡 <strong>해설:</strong> {question.explanation}
            </p>
          )}
        </div>
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
