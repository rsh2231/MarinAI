"use client";

import { useState } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { QnaItem } from "@/types/ProblemViewer";
import {
  answersAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  allQuestionsAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { transformData } from "@/lib/problem-utils";
import { CbtSettings } from "./setting/CbtSetting";
import { CbtInProgress } from "./CbtInProgress";
import { ResultView } from "@/components/problem/UI/ResultView";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";
type ExamStatus = "not-started" | "in-progress" | "finished";
const DURATION_PER_SUBJECT_SECONDS = 25 * 60;

interface CbtViewerProps {
    status: ExamStatus;
    setStatus: (status: ExamStatus) => void;
}

export default function CbtViewer({ status, setStatus }: CbtViewerProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setAnswers = useSetAtom(answersAtom);
  const setGroupedQuestions = useSetAtom(groupedQuestionsAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);

  const allQuestionsData = useAtomValue(allQuestionsAtom);
  const answers = useAtomValue(answersAtom);

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
        const totalDuration = transformed.length * DURATION_PER_SUBJECT_SECONDS;
        setTimeLeft(totalDuration);

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
    setTimeLeft(0);
  };

  const handleRetry = () => {
    setAnswers({});
    setGroupedQuestions([]);
    setSelectedSubject(null);
    setError("");
    setStatus("not-started"); 
  };

  switch (status) {
    case "in-progress":
      return <CbtInProgress onSubmit={handleSubmit} />;

    case "finished":
      const correctAnswers = allQuestionsData.filter(
        (q) => answers[q.id.toString()] === q.answer
      ).length;
      return (
        <ResultView
          total={allQuestionsData.length}
          correct={correctAnswers}
          onRetry={handleRetry}
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