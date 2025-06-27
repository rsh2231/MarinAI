"use client";

import Image from "next/image";
import { Question } from "@/types/ProblemViwer";
import { extractImageCode, getAnswerLabel } from "@/utils/problemUtils";

interface Props {
  question: Question;
  selected?: string;
  showAnswer?: boolean;
  onSelect: (choice: string) => void;
  onToggle: () => void;
  license: string;
  code: string;
}

export default function QuestionCard({ question, selected, showAnswer, onSelect, onToggle, license, code }: Props) {
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
  const hasImage = typeof finalImageCode === "string" && finalImageCode.trim().length > 0;
  const imagePath = hasImage ? `/data/${license}/${code}/${code}-${finalImageCode}.png` : null;

  return (
    <article className="bg-[#1f2937] border border-gray-700 rounded-xl shadow-sm mb-6 p-5">
      <div className="mb-4 text-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 font-medium text-sm sm:text-base">
          <span className="text-gray-400 flex-shrink-0">문제 {question.num}</span>
          <p className="whitespace-pre-wrap">{textWithoutImage}</p>
        </div>
      </div>

      {hasImage && imagePath && (
        <div className="mb-4 flex justify-center">
          <Image
            src={imagePath}
            alt={`문제 ${question.num} 이미지`}
            width={600}
            height={400}
            className="rounded border border-gray-600"
          />
        </div>
      )}

      <ul className="space-y-2 mt-3">
        {options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.label === correctAnswer;
          const isWrong = isSelected && !isCorrect && showAnswer;

          const base = "w-full text-left px-4 py-2 rounded-md border transition-all duration-200 ease-in-out cursor-pointer select-none text-sm";
          const selectedCls = isSelected ? "border-blue-500 bg-blue-900/20" : "border-gray-600 hover:bg-gray-800";
          const correctCls = showAnswer && isCorrect ? "bg-green-900/30 border-green-500 text-green-300" : "";
          const wrongCls = showAnswer && isWrong ? "bg-red-900/30 border-red-500 text-red-300" : "";
          const finalCls = `${base} ${selectedCls} ${correctCls} ${wrongCls}`;

          return (
            <li key={opt.label} className={finalCls} onClick={() => onSelect(opt.label)}>
              <span className="mr-1">{opt.label}.</span> {opt.value}
            </li>
          );
        })}
      </ul>

      <button onClick={onToggle} className="mt-4 text-sm text-blue-400 hover:underline">
        {showAnswer ? "정답 숨기기" : "정답 보기"}
      </button>

      {showAnswer && (
        <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap">
          ✅ <strong>정답 :</strong> {correctAnswer}. {correctText}
          {question.explanation && (
            <p className="mt-2 text-gray-400">
              💡 <strong>해설 :</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
