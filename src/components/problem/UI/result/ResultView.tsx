"use client";

import React, { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import {
  groupedQuestionsAtom,
  answersAtom,
  allQuestionsAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { motion } from "framer-motion";

import { OverallSummary } from "./OverallSummary";
import { ExamSummaryCard } from "./ExamSummaryCard";
import { SubjectBreakdownCard } from "./SubjectBreakdownCard";
import { ProblemReviewHeader } from "./ProblemReiviewHeader";
import { QuestionResultCard } from "./QuestionResultCard";
import { EmptyMessage } from "@/components/ui/EmptyMessage";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface ResultViewProps {
  onRetry: () => void;
  license: LicenseType;
  totalDuration: number;
}

export interface SubjectResult {
  subjectName: string;
  score: number;
  isPass: boolean;
  correctCount: number;
  totalCount: number;
}

export const ResultView = ({
  onRetry,
  license,
  totalDuration,
}: ResultViewProps) => {
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const answers = useAtomValue(answersAtom);
  const timeLeft = useAtomValue(timeLeftAtom);

  const [showOnlyWrong, setShowOnlyWrong] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const { isPass, overallScore, subjectResults } = useMemo(() => {
    if (groupedQuestions.length === 0) {
      return { isPass: false, overallScore: 0, subjectResults: [] };
    }
    let totalScoreSum = 0;
    let allSubjectsPassed = true;
    const results: SubjectResult[] = groupedQuestions.map((group) => {
      const correctCount = group.questions.filter(
        (q) => answers[`${group.subjectName}-${q.num}`] === q.answer
      ).length;
      const totalCount = group.questions.length;
      const score =
        totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      totalScoreSum += score;
      const requiredScore =
        license === "항해사" && group.subjectName.includes("법규") ? 60 : 40;
      const isPass = score >= requiredScore;
      if (!isPass) {
        allSubjectsPassed = false;
      }
      return {
        subjectName: group.subjectName,
        score,
        isPass,
        correctCount,
        totalCount,
      };
    });
    const overallScore = Math.round(totalScoreSum / groupedQuestions.length);
    const averagePassed = overallScore >= 60;
    const finalIsPass = allSubjectsPassed && averagePassed;
    return { isPass: finalIsPass, overallScore, subjectResults: results };
  }, [groupedQuestions, answers, license]);

  const filteredQuestions = useMemo(() => {
    let questions = allQuestions;
    if (showOnlyWrong) {
      questions = questions.filter(
        (q) => answers[`${q.subjectName}-${q.num}`] !== q.answer
      );
    }
    if (selectedSubject !== "all") {
      questions = questions.filter((q) => q.subjectName === selectedSubject);
    }
    return questions;
  }, [allQuestions, answers, showOnlyWrong, selectedSubject]);

  // 시험 요약 카드에 필요한 데이터 계산
  const summaryStats = useMemo(() => {
    const timeTaken = totalDuration - timeLeft;
    const correctCount = allQuestions.filter(
      (q) => answers[`${q.subjectName}-${q.num}`] === q.answer
    ).length;
    const answeredCount = Object.keys(answers).length;
    const incorrectCount = answeredCount - correctCount;
    const unansweredCount = allQuestions.length - answeredCount;
    const weakestSubject =
      [...subjectResults].sort((a, b) => a.score - b.score)[0] || null; // 점수가 가장 낮은 과목 계산

    return {
      timeTaken,
      correctCount,
      incorrectCount,
      unansweredCount,
      weakestSubject,
    };
  }, [totalDuration, timeLeft, allQuestions, answers, subjectResults]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            시험 결과 분석
          </h1>
          <p className="text-neutral-400 mt-2 border-b-2 border-neutral-700 pb-3">
            나의 취약점을 확인하고 다음 시험을 준비하세요.
          </p>
        </header>

        {/* 대시보드 그리드 */}
        <motion.div
          className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:col-span-1 lg:col-span-1">
            <OverallSummary score={overallScore} isPass={isPass} />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <ExamSummaryCard {...summaryStats} />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <SubjectBreakdownCard subjectResults={subjectResults} />
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ProblemReviewHeader
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            showOnlyWrong={showOnlyWrong}
            setShowOnlyWrong={setShowOnlyWrong}
            onRetry={onRetry}
            subjectNames={subjectResults.map((r) => r.subjectName)}
          />

          {filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredQuestions.map((question, index) => (
                <QuestionResultCard
                  key={`${question.subjectName}-${question.num}`}
                  question={question}
                  userAnswer={
                    answers[`${question.subjectName}-${question.num}`]
                  }
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyMessage message="해당 조건에 맞는 문제가 없습니다." />
          )}
        </motion.div>
      </div>
    </div>
  );
};
