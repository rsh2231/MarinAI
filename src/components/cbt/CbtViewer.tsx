"use client";

import { useState, RefObject } from "react";
import { useSetAtom } from "jotai";
import { QnaItem } from "@/types/ProblemViewer";
import {
  answersAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { transformData } from "@/lib/problem-utils";
import { CbtSettings } from "./setting/CbtSetting";
import { CbtInProgress } from "./CbtInProgress";
import { ResultView } from "@/components/problem/result/ResultView";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";
type ExamStatus = "not-started" | "in-progress" | "finished";
const DURATION_PER_SUBJECT_SECONDS = 25 * 60;

interface CbtViewerProps {
  status: ExamStatus;
  setStatus: (status: ExamStatus) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export default function CbtViewer({ status, setStatus, scrollRef }: CbtViewerProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentLicense, setCurrentLicense] = useState<LicenseType | null>(
    null
  );
  const [totalDuration, setTotalDuration] = useState(0);

  const setAnswers = useSetAtom(answersAtom);
  const setGroupedQuestions = useSetAtom(groupedQuestionsAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);

  const handleStartExam = async (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        license: settings.license,
        level: settings.level,
      });
      settings.subjects.forEach((subject) =>
        params.append("subjects", subject)
      );

      const res = await fetch(`/api/cbt?${params.toString()}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "데이터를 불러오는데 실패했습니다."
        );
      }

      const responseData = (await res.json()) as Record<string, QnaItem[]>;
      const allQnas: QnaItem[] = Object.values(responseData).flat();
      const transformed = transformData(allQnas);

      if (transformed.length === 0) {
        setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        setGroupedQuestions([]);
      } else {
        setGroupedQuestions(transformed);
        setSelectedSubject(transformed[0].subjectName);
        setAnswers({});

        const duration = transformed.length * DURATION_PER_SUBJECT_SECONDS;
        setTimeLeft(duration);
        setTotalDuration(duration); // 전체 시간 저장
        setCurrentLicense(settings.license); // 라이선스 종류 저장

        setStatus("in-progress");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setStatus("finished");
  };

  const handleRetry = () => {
    setAnswers({});
    setGroupedQuestions([]);
    setSelectedSubject(null);
    setError("");

    // 재시도 시 상태 초기화
    setCurrentLicense(null);
    setTotalDuration(0);

    setStatus("not-started");
  };

  switch (status) {
    case "in-progress":
      return <CbtInProgress onSubmit={handleSubmit} scrollRef={scrollRef} />;

    case "finished":
      if (!currentLicense) {
        return (
          <div>결과를 표시하는 중 오류가 발생했습니다. 다시 시도해주세요.</div>
        );
      }
      return (
        <ResultView
          license={currentLicense}
          totalDuration={totalDuration}
          onRetry={handleRetry}
          scrollRef={scrollRef}
        />
      );

    case "not-started":
    default:
      return (
        <div className="pt-15">
          <CbtSettings
            onStartCbt={handleStartExam}
            isLoading={isLoading}
            error={error}
          />
        </div>
      );
  }
}
