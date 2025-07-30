"use client";

import { Clock, Check, X, HelpCircle, AlertTriangle } from "lucide-react";
import { SubjectResult } from "@/types/common";

interface ExamSummaryCardProps {
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  weakestSubject: SubjectResult | null;
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const StatItem = ({ icon, label, value, className = "" }: { icon: React.ReactNode, label: string, value: string | number, className?: string }) => (
    <div className={`flex items-center justify-between text-sm ${className}`}>
        <div className="flex items-center gap-2 text-neutral-300">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-semibold text-white">{value}</span>
    </div>
);

export const ExamSummaryCard = ({ timeTaken, correctCount, incorrectCount, unansweredCount, weakestSubject }: ExamSummaryCardProps) => {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">시험 요약</h3>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <StatItem icon={<Clock size={16} />} label="총 풀이 시간" value={formatTime(timeTaken)} />
        <StatItem icon={<Check size={16} className="text-green-500" />} label="정답" value={correctCount} />
        <StatItem icon={<X size={16} className="text-red-500" />} label="오답" value={incorrectCount} />
        <StatItem icon={<HelpCircle size={16} className="text-gray-500" />} label="미답" value={unansweredCount} />
      </div>
      {weakestSubject && (
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <AlertTriangle size={16} />
            <h4 className="font-semibold">가장 취약한 과목</h4>
          </div>
          <p className="text-neutral-200 mt-1 pl-2">
            {weakestSubject.subjectName} ({weakestSubject.score}점)
          </p>
        </div>
      )}
    </div>
  );
};