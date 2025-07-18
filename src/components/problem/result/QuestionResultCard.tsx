"use client";

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

export const QuestionResultCard = ({
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-neutral-800 rounded-lg p-5"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 flex flex-col gap-2 font-medium text-sm sm:text-base break-keep">
          <span className="text-gray-400">
            {question.subjectName} - 문제 {question.num}
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
        <div className="my-4 flex justify-center">
          <Image
            src={question.imageUrl}
            alt={`문제 ${question.num} 이미지`}
            width={500}
            height={300}
            sizes="(min-width: 768px) 512px, 100vw"
            className="rounded border border-gray-600 w-full max-w-lg h-auto object-contain bg-white"
          />
        </div>
      )}

      <ul className="space-y-3 mt-4 break-keep">
        {question.choices.map((choice: Choice) => {
          const isSelected = userAnswer === choice.label;
          const isActualAnswer = question.answer === choice.label;

          return (
            <div
              key={choice.label}
              className={`flex justify-between items-center gap-3 px-4 py-3 rounded-md border text-sm sm:text-base ${getChoiceStyle(
                choice.label,
                userAnswer,
                question.answer
              )}`}
            >
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[24px]">
                  {choice.label}.
                </span>
                <div className="w-full flex justify-start">
                  {choice.isImage && choice.imageUrl ? (
                    <Image
                      src={choice.imageUrl}
                      alt={`보기 ${choice.label}`}
                      width={400}
                      height={200}
                      sizes="(min-width: 768px) 448px, 100vw"
                      className="h-auto w-auto max-w-md max-h-[250px] object-contain rounded bg-white"
                    />
                  ) : (
                    <span className="text-gray-100">{choice.text}</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-xs font-semibold">
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
            </div>
          );
        })}
      </ul>

      <div className="mt-4 border-t border-neutral-700 pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex justify-between items-center w-full text-left text-neutral-300 hover:text-white"
        >
          <span className="font-semibold">해설 보기</span>
          <ChevronsUpDown
            size={18}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 text-sm break-keep"
            >
              <div className="pl-6 border-l-2 border-neutral-600 text-gray-200">
                <div className="whitespace-pre-wrap leading-relaxed break-words text-gray-300">
                  {question.explanation || "이 문제에 대한 해설이 없습니다."}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
