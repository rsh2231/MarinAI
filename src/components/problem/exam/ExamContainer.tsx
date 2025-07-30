"use client";

import { useState, useRef } from "react";
import { useAtomValue } from "jotai";
import { examLoadingAtom, examErrorAtom, showResultAtom } from "@/atoms/examAtoms";
import { useExamData } from "@/hooks/useExamData";
import { useExamActions } from "@/hooks/useExamActions";
import { useExamTimer } from "@/hooks/useExamTimer";
import { LicenseType } from "@/types/common";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { EmptyMessage } from "@/components/ui/EmptyMessage";
import { ResultView } from "../result/ResultView";
import { ExamSession } from "./ExamSession";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ExamContainer({
  year,
  license,
  level,
  round,
  selectedSubjects,
}: Props) {
  const isLoading = useAtomValue(examLoadingAtom);
  const error = useAtomValue(examErrorAtom);
  const showResult = useAtomValue(showResultAtom);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  const examInfo = { year, license, level, round, selectedSubjects };

  // 데이터 로딩 훅
  const { odapsetId, totalDuration } = useExamData({ ...examInfo, retryCount });

  // 시험 액션 훅
  const { handleSubmit, handleRetry: baseHandleRetry } = useExamActions(
    examInfo,
    odapsetId,
    totalDuration,
    mainScrollRef
  );

  // handleRetry 래핑: retryCount 증가 + 기존 로직 호출
  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    baseHandleRetry();
  };

  // 3. 타이머 훅
  useExamTimer(() => handleSubmit({ isAutoSubmitted: true }));

  // --- 조건부 렌더링 ---
  if (isLoading) {
    return <LoadingSpinner text="시험 문제를 불러오는 중입니다..." />;
  }

  if (error) {
    return (
      <div className="h-full bg-[#0f172a] flex items-center justify-center">
        <EmptyMessage message={error} />
      </div>
    );
  }

  if (selectedSubjects.length === 0) {
    return (
      <div className="h-full bg-[#0f172a] flex items-center justify-center">
        <EmptyMessage message="풀이할 과목을 선택해주세요." />
      </div>
    );
  }

  if (showResult) {
    return (
      <ResultView
        onRetry={handleRetry}
        license={license}
        totalDuration={totalDuration}
        scrollRef={mainScrollRef}
        forceScreenHeight={true}
        year={year}
        round={round}
        level={license !== "소형선박조종사" ? level : undefined}
      />
    );
  }

  return <ExamSession onSubmit={handleSubmit} scrollRef={mainScrollRef} />;
}
