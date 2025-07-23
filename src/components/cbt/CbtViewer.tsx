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
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentLicense, setCurrentLicense] = useState<LicenseType | null>(
    null
  );
  const [currentLevel, setCurrentLevel] = useState<string>("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentOdapsetId, setCurrentOdapsetId] = useState<number | null>(null);
  const setAnswers = useSetAtom(answersAtom);
  const setGroupedQuestions = useSetAtom(groupedQuestionsAtom);
  const setSelectedSubjectAtom = useSetAtom(selectedSubjectAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);

  // 인증 상태 가져오기
  const auth = useAtomValue(authAtom);

  useEffect(() => {
    if (groupedQuestions.length > 0) {
      setCurrentIdx(0);
      setSelectedSubjectAtom(groupedQuestions[0].subjectName);
    }
  }, [groupedQuestions, setCurrentIdx, setSelectedSubjectAtom]);

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

      // 인증 헤더 추가 (선택적)
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // 로그인한 사용자만 인증 헤더 추가
      if (auth.token && auth.isLoggedIn) {
        headers.Authorization = `Bearer ${auth.token}`;
        console.log("로그인한 사용자로 CBT 시작", auth);
      } else {
        console.log("비로그인 사용자로 CBT 시작");
      }

      const res = await fetch(`/api/cbt?${params.toString()}`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "데이터를 불러오는데 실패했습니다."
        );
      }

      const responseData = (await res.json()) as CbtData;
      console.log("CBT API Response:", responseData);

      if (responseData.odapset_id) {
        setCurrentOdapsetId(responseData.odapset_id);
      } else {
        setCurrentOdapsetId(null);
      }

      // 새로운 응답 구조 처리
      let allQnas: QnaItem[] = [];
      if (responseData.subjects) {
        // subjects 객체의 모든 값들을 배열로 변환
        allQnas = Object.values(responseData.subjects).flat();
        console.log("Extracted QnAs from subjects:", allQnas.length);
      } else {
        // 기존 구조와의 호환성을 위해 fallback
        allQnas = Object.values(responseData).flat() as QnaItem[];
        console.log("Using fallback structure, QnAs:", allQnas.length);
      }

      const transformed = transformData(allQnas);
      console.log("Transformed data:", transformed.length, "subject groups");

      if (transformed.length === 0) {
        setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        setGroupedQuestions([]);
      } else {
        setGroupedQuestions(transformed);
        setAnswers({});
        setCurrentIdx(0);
        setSelectedSubjectAtom(transformed[0].subjectName);
        const duration = transformed.length * DURATION_PER_SUBJECT_SECONDS;
        setTimeLeft(duration);
        setTotalDuration(duration); // 전체 시간 저장
        setCurrentLicense(settings.license); // 라이선스 종류 저장
        setCurrentLevel(settings.level); // 레벨 저장
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
    setSelectedSubjectAtom(null);
    setError("");
    setCurrentLicense(null);
    setCurrentLevel("");
    setTotalDuration(0);
    setCurrentOdapsetId(null);
    setCurrentIdx(0);
    setStatus("not-started");
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
          <div>결과를 표시하는 중 오류가 발생했습니다. 다시 시도해주세요.</div>
        );
      }
      return (
        <ResultView
          license={currentLicense}
          totalDuration={totalDuration}
          onRetry={handleRetry}
          scrollRef={scrollRef}
          level={currentLicense !== "소형선박조종사" ? currentLevel : undefined}
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
