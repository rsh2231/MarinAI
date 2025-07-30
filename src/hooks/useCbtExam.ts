import { useState } from "react";
import { useSetAtom, useAtom, useAtomValue } from "jotai";
import { QnaItem, CbtData, SubjectGroup } from "@/types/ProblemViewer";
import { authAtom } from "@/atoms/authAtom";
import {
  answersAtom,
  currentQuestionIndexAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { transformData } from "@/lib/problem-utils";
import { LicenseType } from "@/types/common";

export type ExamStatus = "not-started" | "in-progress" | "finished";
const DURATION_PER_SUBJECT_SECONDS = 25 * 60;

interface UseCbtExamReturn {
  error: string;
  isLoading: boolean;
  currentLicense: LicenseType | null;
  currentLevel: string;
  totalDuration: number;
  currentOdapsetId: number | null;
  groupedQuestions: SubjectGroup[];
  handleStartExam: (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => Promise<void>;
  handleRetrySameExam: () => void;
  setCurrentLicense: (license: LicenseType | null) => void;
  setCurrentLevel: (level: string) => void;
}

export function useCbtExam(status: ExamStatus, setStatus: (status: ExamStatus) => void, scrollRef: React.RefObject<HTMLDivElement | null>): UseCbtExamReturn {
  const setAnswers = useSetAtom(answersAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);
  const [groupedQuestions, setGroupedQuestions] = useAtom<SubjectGroup[]>(groupedQuestionsAtom);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLicense, setCurrentLicense] = useState<LicenseType | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentOdapsetId, setCurrentOdapsetId] = useState<number | null>(null);

  const auth = useAtomValue(authAtom);

  // 시험 시작
  const handleStartExam = async (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => {
    setIsLoading(true);
    setError("");
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
        setGroupedQuestions(transformed);
        setAnswers({});
        setCurrentIdx(0);
        setSelectedSubject(transformed[0].subjectName); // 첫 과목으로 세팅
        const duration = transformed.length * DURATION_PER_SUBJECT_SECONDS;
        setTimeLeft(duration);
        setTotalDuration(duration);
        setStatus("in-progress");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 다시 풀기
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
      scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return {
    error,
    isLoading,
    currentLicense,
    currentLevel,
    totalDuration,
    currentOdapsetId,
    groupedQuestions,
    handleStartExam,
    handleRetrySameExam,
    setCurrentLicense,
    setCurrentLevel,
  };
} 