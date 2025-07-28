"use client";

import Button from "@/components/ui/Button";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { SubjectFilterTabs } from "./SubjectFilterTab";

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
  subjectNames,
}: ProblemReviewHeaderProps) => {
  return (
    <div>
      {/* 상단: 제목과 다시보기 옵션 버튼 */}
      <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold order-1 md:order-none">
          {selectedSubject === "all"
            ? "전체 문제 다시보기"
            : `${selectedSubject} 문제 다시보기`}
        </h2>
        <div className="flex gap-2 order-2 md:order-none">
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setShowOnlyWrong(!showOnlyWrong)}
          >
            {showOnlyWrong ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="ml-2">
              {showOnlyWrong ? "전체 보기" : "틀린 문제만"}
            </span>
          </Button>
          <Button variant="primary" size="sm" onClick={onRetry}>
            <RotateCcw size={16} />
            <span className="ml-2">다시 풀기</span>
          </Button>
        </div>
      </div>

      <SubjectFilterTabs
        subjectNames={subjectNames}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
      />
    </div>
  );
};
