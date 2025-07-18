"use client";

import Button from "@/components/ui/Button";
import { Eye, EyeOff, RotateCcw } from "lucide-react";

interface ProblemReviewHeaderProps {
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  showOnlyWrong: boolean;
  setShowOnlyWrong: (value: boolean) => void;
  onRetry: () => void;
  subjectNames: string[];
}

export const ProblemReviewHeader = ({
  selectedSubject,
  setSelectedSubject,
  showOnlyWrong,
  setShowOnlyWrong,
  onRetry,
  subjectNames
}: ProblemReviewHeaderProps) => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-700 pb-3">
        <h2 className="text-2xl font-bold">
            {selectedSubject === "all" ? "전체 문제 다시보기" : `${selectedSubject} 문제 다시보기`}
        </h2>
        {/* 다시보기 옵션 버튼들 */}
        <div className="flex gap-2">
           <Button variant="neutral" size="sm" onClick={() => setShowOnlyWrong(!showOnlyWrong)}>
             {showOnlyWrong ? <Eye size={16} /> : <EyeOff size={16} />}
             <span className="ml-2">{showOnlyWrong ? "전체 보기" : "틀린 문제만"}</span>
           </Button>
           <Button variant="primary" size="sm" onClick={onRetry}>
             <RotateCcw size={16} />
             <span className="ml-2">다시 풀기</span>
           </Button>
        </div>
      </div>
      {/* 과목 필터 버튼들 */}
      <div className="flex flex-wrap justify-end gap-2 py-4">
        <Button variant="neutral" size="sm" onClick={() => setSelectedSubject("all")} selected={selectedSubject === 'all'}>
          전체
        </Button>
        {subjectNames.map(name => (
          <Button key={name} variant="neutral" size="sm" onClick={() => setSelectedSubject(name)} selected={selectedSubject === name}>
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
};