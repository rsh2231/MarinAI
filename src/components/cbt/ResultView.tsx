"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import {
  groupedQuestionsAtom,
  answersAtom,
  showResultAtom,
  currentQuestionIndexAtom,
} from "@/atoms/cbtAtoms";
import { Eye, EyeOff, RotateCcw, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Button from "@/components/ui/Button";

const COLORS = {
  correct: "#60a5fa", // 파란 연한색
  incorrect: "#f87171", // 연한 빨강
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent === 0) return null;
  return (
    <text
      x={x}
      y={y}
      fill="var(--foreground-dark)"
      fontSize={14}
      fontWeight="700"
      textAnchor="middle"
      dominantBaseline="central"
      pointerEvents="none"
      style={{ userSelect: "none" }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export const ResultView = () => {
  const [groupedQuestions] = useAtom(groupedQuestionsAtom);
  const [answers] = useAtom(answersAtom);
  const [, setShowResult] = useAtom(showResultAtom);
  const [, setCurrentIdx] = useAtom(currentQuestionIndexAtom);

  const [showOnlyWrong, setShowOnlyWrong] = useState(false);
  const [view, setView] = useState<"summary" | "details">("summary");

  const handleRetryWrong = () => {
    setShowResult(false);
    setCurrentIdx(0);
  };

  return (
    <div className="p-6 min-h-screen bg-background-dark text-foreground-dark font-sans select-none">
      {/* 헤더 및 토글 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary select-text">
          📊 시험 결과
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={() => setView(view === "summary" ? "details" : "summary")}
            variant="neutral"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-secondary hover:bg-secondary transition"
          >
            <BarChart2 className="w-5 h-5" />
            <span>{view === "summary" ? "상세 보기" : "요약 보기"}</span>
          </Button>

          <Button
            onClick={() => setShowOnlyWrong(!showOnlyWrong)}
            variant="neutral"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-secondary hover:bg-secondary transition"
          >
            {showOnlyWrong ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
            <span>{showOnlyWrong ? "전체 보기" : "틀린 문제만"}</span>
          </Button>

          <Button
            onClick={handleRetryWrong}
            variant="primary"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg hover:brightness-110 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>틀린 문제 다시 풀기</span>
          </Button>
        </div>
      </div>

      {view === "summary" ? (
        /* 요약 - 파이 차트 */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          style={{ minHeight: 320 }}
          aria-label="과목별 정답 오답 파이 차트"
        >
          {groupedQuestions.map((group, index) => {
            const subject = group.subjectName.replace(/^\d+\.\s*/, "");
            const correct = group.questions.filter((q) => {
              const key = `${subject}-${q.num}`;
              return answers[key] === q.answer;
            }).length;
            const total = group.questions.length;
            const incorrect = total - correct;
            const accuracy = Math.round((correct / total) * 100);
            const chartData = [
              { name: "정답", value: correct },
              { name: "오답", value: incorrect },
            ];
            return (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-secondary rounded-lg border border-secondary p-6 shadow-card flex flex-col items-center"
                aria-label={`${subject} 과목 결과: 정답률 ${accuracy}%`}
              >
                <h3 className="mb-4 text-xl font-semibold text-primary text-center">
                  {subject}
                </h3>
                <div className="w-full h-52">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        label={renderCustomLabel}
                        paddingAngle={4}
                        cornerRadius={8}
                        isAnimationActive
                      >
                        <Cell fill={COLORS.correct} />
                        <Cell fill={COLORS.incorrect} />
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value} 문제`,
                          name,
                        ]}
                        wrapperStyle={{ fontSize: 14 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-4 text-foreground-light font-mono text-base">
                  정답률: <span className="font-bold">{accuracy}%</span> (
                  {correct}/{total})
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* 상세 보기 - 문제별 결과 목록 */
        <div className="space-y-8">
          {groupedQuestions.map((group) => {
            const subject = group.subjectName.replace(/^\d+\.\s*/, "");
            return (
              <motion.section
                key={subject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-4 border-b border-secondary pb-2">
                  {subject}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.questions.map((q) => {
                    const key = `${subject}-${q.num}`;
                    const userAnswer = answers[key];
                    const isCorrect = userAnswer === q.answer;
                    if (showOnlyWrong && isCorrect) return null;
                    return (
                      <div
                        key={q.num}
                        className={`flex flex-col p-5 rounded-lg border shadow-card transition-transform duration-300 ${
                          isCorrect
                            ? "border-2 border-green-500"
                            : "border-2 border-red-500"
                        } hover:scale-[1.03]`}
                      >
                        <div className="font-mono text-base mb-3">
                          문제 {q.num}번 -{" "}
                          <span
                            className={`font-semibold ${
                              isCorrect ? "text-success" : "text-danger"
                            }`}
                          >
                            {isCorrect ? "정답" : "오답"}
                          </span>
                        </div>
                        <div className="text-sm text-foreground-light leading-relaxed whitespace-pre-wrap">
                          나의 답안:{" "}
                          <span className="font-semibold text-yellow-400">
                            {userAnswer ?? "미답"}
                          </span>
                          {!isCorrect && (
                            <>
                              <br />
                              정답:{" "}
                              <span className="font-semibold text-foreground">
                                {q.answer}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
};
