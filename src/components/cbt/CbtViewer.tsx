"use client";

import { RefObject } from "react";
import { CbtSettings } from "./setting/CbtSetting";
import { CbtInProgress } from "./CbtInProgress";
import { ResultView } from "@/components/problem/result/ResultView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useCbtExam, ExamStatus } from "@/hooks/useCbtExam";
export interface CbtViewerProps {
  status: ExamStatus;
  setStatus: (status: ExamStatus) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export default function CbtViewer({
  status,
  setStatus,
  scrollRef,
}: CbtViewerProps) {
  const {
    error,
    isLoading,
    currentLicense,
    currentLevel,
    totalDuration,
    currentOdapsetId,

    handleStartExam,
    handleRetrySameExam,
  } = useCbtExam(status, setStatus, scrollRef);

  // CbtInProgress에서 '제출하기'를 눌렀을 때 호출
  const handleSubmit = () => {
    setStatus("finished");
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="CBT 문제를 불러오는 중입니다..." />;
  }

  switch (status) {
    case "in-progress":
      return (
        <CbtInProgress
          onSubmit={handleSubmit}
          scrollRef={scrollRef}
          license={currentLicense}
          level={currentLevel}
          odapsetId={currentOdapsetId}
        />
      );

    case "finished":
      if (!currentLicense) {
        return (
          <div className="flex items-center justify-center h-full">
            <p>결과를 표시하는 중 오류가 발생했습니다. 다시 시도해주세요.</p>
          </div>
        );
      }
      return (
        <ResultView
          license={currentLicense}
          totalDuration={totalDuration}
          onRetry={handleRetrySameExam}
          scrollRef={scrollRef}
          level={currentLicense !== "소형선박조종사" ? currentLevel : undefined}
          forceScreenHeight={true}
        />
      );

    case "not-started":
    default:
      return (
        <div className="flex justify-center items-center h-full">
          <CbtSettings
            onStartCbt={handleStartExam}
            isLoading={isLoading}
            error={error}
          />
        </div>
      );
  }
}