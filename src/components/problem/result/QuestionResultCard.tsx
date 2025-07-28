"use client";

import React from "react";
import { useState } from "react";
import { Question, Choice } from "@/types/ProblemViewer";
import { Check, X, ChevronsUpDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface QuestionResultCardProps {
  question: Question;
  userAnswer?: string;
  index: number;
}

const getChoiceStyle = (
  choiceLabel: string,
  userAnswer: string | undefined,
  correctAnswer: string
) => {
  const isCorrect = choiceLabel === correctAnswer;
  const isSelected = choiceLabel === userAnswer;

  if (isCorrect) {
    return "bg-green-900/50 border-green-500 text-white";
  }
  if (isSelected) {
    return "bg-red-900/50 border-red-500 text-white";
  }
  return "bg-neutral-700/50 border-neutral-600 text-neutral-300";
};

type StatusType = "correct" | "incorrect" | "unanswered";

const getStatus = (
  userAnswer: string | undefined,
  correctAnswer: string
): { status: StatusType; isCorrect: boolean } => {
  if (userAnswer === undefined || userAnswer === null) {
    return { status: "unanswered", isCorrect: false };
  }
  const isCorrect = userAnswer === correctAnswer;
  return { status: isCorrect ? "correct" : "incorrect", isCorrect };
};

const QuestionResultCardInner = ({
  question,
  userAnswer,
  index,
}: QuestionResultCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { status, isCorrect } = getStatus(userAnswer, question.answer);

  const badgeStyles: Record<StatusType, string> = {
    correct: "bg-green-500/20 text-green-300",
    incorrect: "bg-red-500/20 text-red-300",
    unanswered: "bg-neutral-600/50 text-neutral-400",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative bg-neutral-800/50 border border-neutral-700 rounded-xl shadow-lg mb-6 p-5 transition-colors`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 flex flex-col gap-2 font-medium text-sm sm:text-base break-keep">
          <span className="text-gray-400">
            {question.subjectName ? `${question.subjectName} - ` : ""}문제{" "}
            {question.num}
          </span>
          {question.questionStr && (
            <p className="whitespace-pre-wrap leading-relaxed text-gray-100">
              {question.questionStr}
            </p>
          )}
        </div>
        <div
          className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${badgeStyles[status]}`}
        >
          {status === "correct" && <Check size={16} />}
          {status === "incorrect" && <X size={16} />}
          {status === "unanswered" && <HelpCircle size={16} />}
          <span>
            {status === "correct"
              ? "정답"
              : status === "incorrect"
              ? "오답"
              : "미답"}
          </span>
        </div>
      </div>

      {question.imageUrl && (
        <div className="my-4 flex justify-center w-full overflow-hidden">
          <Image
            src={question.imageUrl}
            alt={`문제 ${question.num} 이미지`}
            width={400}
            height={250}
            sizes="(max-width: 640px) 90vw, 400px"
            className="rounded object-contain max-w-[90vw] max-h-[40vw] sm:max-w-[400px] sm:max-h-[250px] w-auto h-auto"
          />
        </div>
      )}

      <ul className="space-y-3 mt-4 break-keep">
        {question.choices.map((choice: Choice) => {
          const isSelected = userAnswer === choice.label;
          const isActualAnswer = question.answer === choice.label;

          const base =
            "flex items-start gap-3 px-4 py-3 rounded-md border transition-all text-sm sm:text-base"; // 👈 items-center -> items-start 로 변경
          const selectedCls = isSelected
            ? "border-blue-500 bg-blue-900/30"
            : "border-neutral-700 hover:bg-neutral-700/50";
          const correctCls = isActualAnswer
            ? "!border-green-500 !bg-green-900/30 !text-green-300"
            : "";
          const wrongCls =
            isSelected && !isActualAnswer
              ? "!border-red-500 !bg-red-900/30 !text-red-300"
              : "";

          return (
            <li
              key={choice.label}
              className={`${base} ${selectedCls} ${correctCls} ${wrongCls}`}
            >
              <span className="font-semibold min-w-[24px] pt-1">
                {choice.label}.
              </span>{" "}

              {choice.isImage && choice.imageUrl ? (
                <div className="flex-1 flex justify-start overflow-hidden">
                  {" "}
                  <Image
                    src={choice.imageUrl}
                    alt={`보기 ${choice.label}`}
                    width={500}
                    height={125} 
                    sizes="(max-width: 640px) 80vw, 500px" 
                    className="rounded object-contain max-w-full sm:max-w-md w-auto h-auto"
                  />
                </div>
              ) : (
                <span className="text-gray-100">{choice.text}</span>
              )}
              {/* 상태 뱃지 */}
              <div className="flex-shrink-0 text-xs font-semibold ml-auto flex gap-1">
                {isSelected && !isActualAnswer && (
                  <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-300">
                    내 답안
                  </span>
                )}
                {status !== "unanswered" && isActualAnswer && (
                  <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-300">
                    정답
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-5 text-sm text-blue-400 hover:underline"
          type="button"
        >
          {isExpanded ? "▲ 해설 숨기기" : "▼ 해설 보기"}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              layout="size"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden mt-3 text-sm break-keep"
            >
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed break-words pt-3 border-t border-neutral-700">
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2 text-gray-300">
                    <strong>💡 해설</strong>
                  </div>
                  <div className="pl-6 border-l-2 border-neutral-600 text-gray-200">
                    {question.explanation ? (
                      <p>{question.explanation}</p>
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
    </motion.article>
  );
};

export const QuestionResultCard = React.memo(QuestionResultCardInner);
