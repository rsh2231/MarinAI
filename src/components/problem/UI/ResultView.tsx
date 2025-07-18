"use client";

import React, { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import {
  groupedQuestionsAtom,
  answersAtom,
  allQuestionsAtom,
} from "@/atoms/examAtoms";
import { motion } from "framer-motion";
import { OverallSummary } from "./result/OverallSummary";
import { ResultSidebar } from "./result/ResultSidebar";
import { QuestionResultCard } from "./result/QuestionResultCard";
import { EmptyMessage } from "@/components/ui/EmptyMessage";
import Button from "@/components/ui/Button"; 

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface ResultViewProps {
  onRetry: () => void;
  license: LicenseType;
}

export interface SubjectResult {
  subjectName: string;
  score: number;
  isPass: boolean;
  correctCount: number;
  totalCount: number;
}

export const ResultView = ({ onRetry, license }: ResultViewProps) => {
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const answers = useAtomValue(answersAtom);

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
        (q) => answers[`${q.subjectName}-${q.num}`] === q.answer
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

  const subjectNames = subjectResults.map(r => r.subjectName);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            시험 결과 분석
          </h1>
          <p className="text-neutral-400 mt-2">
            나의 취약점을 확인하고 다음 시험을 준비하세요.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold border-b-2 border-neutral-700 pb-3">
              {selectedSubject === "all"
                ? "전체 문제 다시보기"
                : `${selectedSubject} 문제 다시보기`}
            </h2>

            <div className="flex flex-wrap gap-2 py-2">
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setSelectedSubject("all")}
                selected={selectedSubject === 'all'}
              >
                전체
              </Button>
              {subjectNames.map(name => (
                <Button
                  key={name}
                  variant="neutral"
                  size="sm"
                  onClick={() => setSelectedSubject(name)}
                  selected={selectedSubject === name}
                >
                  {name}
                </Button>
              ))}
            </div>

            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <QuestionResultCard
                  key={`${question.subjectName}-${question.num}`}
                  question={question}
                  userAnswer={
                    answers[`${question.subjectName}-${question.num}`]
                  }
                  index={index}
                />
              ))
            ) : (
              <EmptyMessage message="해당 조건에 맞는 문제가 없습니다." />
            )}
          </motion.div>

          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <OverallSummary score={overallScore} isPass={isPass} />
            <ResultSidebar
              subjectResults={subjectResults}
              onRetry={onRetry}
              showOnlyWrong={showOnlyWrong}
              setShowOnlyWrong={setShowOnlyWrong}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};