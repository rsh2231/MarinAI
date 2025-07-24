"use client";

import { useState, RefObject, useEffect } from "react";
import { useSetAtom, useAtomValue, useAtom } from "jotai";
import { QnaItem, CbtData } from "@/types/ProblemViewer";
import { authAtom } from "@/atoms/authAtom";
import {
  answersAtom,
  currentQuestionIndexAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { transformData } from "@/lib/problem-utils";
import { CbtSettings } from "./setting/CbtSetting";
import { CbtInProgress } from "./CbtInProgress";
import { ResultView } from "@/components/problem/result/ResultView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";
type ExamStatus = "not-started" | "in-progress" | "finished";
const DURATION_PER_SUBJECT_SECONDS = 25 * 60;

interface CbtViewerProps {
  status: ExamStatus;
  setStatus: (status: ExamStatus) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export default function CbtViewer({
  status,
  setStatus,
  scrollRef,
}: CbtViewerProps) {
  // 상태 설정(set)을 위한 Atom Setter들
  const setAnswers = useSetAtom(answersAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);
  
  // 그룹화된 문제 데이터는 '다시 풀기'를 위해 계속 상태를 유지해야 함
  const [groupedQuestions, setGroupedQuestions] = useAtom(groupedQuestionsAtom);

  // 이 컴포넌트에서 직접 관리해야 할 상태들
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // '다시 풀기'를 위해 시험 정보를 상태로 유지
  const [currentLicense, setCurrentLicense] = useState<LicenseType | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentOdapsetId, setCurrentOdapsetId] = useState<number | null>(null);

  const auth = useAtomValue(authAtom);

  // 시험 시작 또는 재시작 시 첫 과목/문제 설정
  useEffect(() => {
    if (status === "in-progress" && groupedQuestions.length > 0) {
      setCurrentIdx(0);
      setSelectedSubject(groupedQuestions[0].subjectName);
    }
  }, [status, groupedQuestions, setCurrentIdx, setSelectedSubject]);

  // CbtSettings에서 시험을 처음 시작할 때 호출
  const handleStartExam = async (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => {
    setIsLoading(true);
    setError("");

    // '다시 풀기'를 위해 시험 설정 저장
    setCurrentLicense(settings.license);
    setCurrentLevel(settings.level);

    try {
      const params = new URLSearchParams({
        license: settings.license,
        level: settings.level,
      });
      settings.subjects.forEach((subject) => params.append("subjects", subject));

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (auth.token && auth.isLoggedIn) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const res = await fetch(`/api/cbt?${params.toString()}`, { method: "GET", headers });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "데이터를 불러오는데 실패했습니다.");
      }

      const responseData = (await res.json()) as CbtData;
      
      setCurrentOdapsetId(responseData.odapset_id ?? null);

      const allQnas: QnaItem[] = responseData.subjects ? Object.values(responseData.subjects).flat() : [];

      const transformed = transformData(allQnas);
      if (transformed.length === 0) {
        setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        setGroupedQuestions([]);
      } else {
        // 전역 상태 설정
        setGroupedQuestions(transformed);
        setAnswers({});
        const duration = transformed.length * DURATION_PER_SUBJECT_SECONDS;
        setTimeLeft(duration);
        setTotalDuration(duration);
        
        setStatus("in-progress");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // CbtInProgress에서 '제출하기'를 눌렀을 때 호출
  const handleSubmit = () => {
    setStatus("finished");
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // ResultView에서 "다시 풀기"를 눌렀을 때의 동작
  const handleRetrySameExam = () => {
    if (groupedQuestions.length === 0 || !currentLicense) {
        setStatus("not-started");
        return;
    }
    
    setAnswers({});
    setTimeLeft(totalDuration);
    setCurrentIdx(0);
    setSelectedSubject(groupedQuestions[0].subjectName);

    setStatus("in-progress");
    
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