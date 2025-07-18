"use client";

import Button from "@/components/ui/Button";
import { Eye, EyeOff, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { SubjectResult } from "../ResultView";

interface ResultSidebarProps {
  subjectResults: SubjectResult[];
  onRetry: () => void;
  showOnlyWrong: boolean;
  setShowOnlyWrong: (value: boolean) => void;
}

export const ResultSidebar = ({
  subjectResults,
  onRetry,
  showOnlyWrong,
  setShowOnlyWrong,
}: ResultSidebarProps) => {

  return (
    <div className="space-y-6">
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg space-y-3">
        <h3 className="text-xl font-bold mb-4">다시보기 옵션</h3>
        <Button
          variant="neutral"
          onClick={() => setShowOnlyWrong(!showOnlyWrong)}
          className="w-full flex items-center justify-center gap-2"
        >
          {showOnlyWrong ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>{showOnlyWrong ? "전체 문제 보기" : "틀린 문제만 보기"}</span>
        </Button>
        <Button
          variant="primary"
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          <span>다시 풀기</span>
        </Button>
      </div>

      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">과목별 성취도</h3>

        <div className="space-y-4">
          {subjectResults.map(result => (
            <div key={result.subjectName}>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold flex items-center gap-1.5">
                  {result.isPass ? <CheckCircle size={14} className="text-blue-500" /> : <XCircle size={14} className="text-red-500" />}
                  {result.subjectName}
                </span>
                <span className="text-neutral-300">{result.score}% ({result.correctCount}/{result.totalCount})</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2.5">
                <div 
                  className={`${result.isPass ? 'bg-blue-600' : 'bg-red-600'} h-2.5 rounded-full`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};