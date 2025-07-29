import React from "react";
import { OverallSummary } from "./OverallSummary";
import { ExamSummaryCard } from "./ExamSummaryCard";
import { SubjectBreakdownCard } from "./SubjectBreakdownCard";
import { SubjectResult } from "./ResultView";

interface ExamSummaryStats {
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  weakestSubject: SubjectResult | null;
}

export default function ResultDashboard({ overallScore, isPass, summaryStats, subjectResults }: {
  overallScore: number;
  isPass: boolean;
  summaryStats: ExamSummaryStats;
  subjectResults: SubjectResult[];
}) {
  return (
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
      <div className="md:col-span-1 lg:col-span-1">
        <OverallSummary score={overallScore} isPass={isPass} />
      </div>
      <div className="md:col-span-1 lg:col-span-1">
        <ExamSummaryCard {...summaryStats} />
      </div>
      <div className="md:col-span-2 lg:col-span-1">
        <SubjectBreakdownCard subjectResults={subjectResults} />
      </div>
    </div>
  );
} 