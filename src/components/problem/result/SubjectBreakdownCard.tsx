"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { SubjectResult } from "@/types/common";

interface SubjectBreakdownCardProps {
  subjectResults: SubjectResult[];
}

export const SubjectBreakdownCard = ({ subjectResults }: SubjectBreakdownCardProps) => {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">과목별 성취도</h3>
      <div className="space-y-4">
        {subjectResults.map(result => (
          <div key={result.subjectName}>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-semibold flex items-center gap-1.5">
                {result.isPass ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                {result.subjectName}
              </span>
              <span className="text-neutral-300">{result.score}% ({result.correctCount}/{result.totalCount})</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2.5">
              <div 
                className={`${result.isPass ? 'bg-green-600' : 'bg-red-600'} h-2.5 rounded-full`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};