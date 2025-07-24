"use client";

import { useRef } from "react";
import { useAtomValue } from "jotai";
import {
  examLoadingAtom,
  examErrorAtom,
  showResultAtom,
} from "@/atoms/examAtoms";
import { useExamData } from "@/hooks/useExamData";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useExamActions } from "@/hooks/useExamActions";
import { ResultView } from "../result/ResultView";
import { ExamSession } from "./ExamSession";
import { EmptyMessage } from "../../ui/EmptyMessage";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

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

  const examInfo = { year, license, level, round, selectedSubjects };

  // 1. 데이터 로딩 훅
  const { odapsetId, totalDuration } = useExamData(examInfo);

  // 2. 시험 액션 훅
  const { handleSubmit, handleRetry } = useExamActions(
    examInfo,
    odapsetId,
    totalDuration,
    mainScrollRef
  );

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
