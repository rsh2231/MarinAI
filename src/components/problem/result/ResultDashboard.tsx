import React from "react";
import { OverallSummary } from "./OverallSummary";
import { ExamSummaryCard } from "./ExamSummaryCard";
import { SubjectBreakdownCard } from "./SubjectBreakdownCard";
import { SubjectResult, ExamSummaryStats } from "@/types/common";

interface ResultDashboardProps {
  overallScore: number;
  isPass: boolean;
  summaryStats: ExamSummaryStats;
  subjectResults: SubjectResult[];
}

export default function ResultDashboard({ overallScore, isPass, summaryStats, subjectResults }: ResultDashboardProps) {
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