"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import {
  examLoadingAtom,
  examErrorAtom,
  timeLeftAtom,
  selectedSubjectAtom,
  groupedQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  allQuestionsAtom,
  showResultAtom,
} from "@/atoms/examAtoms";

import { QnaItem, Question } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";

import { ResultView } from "../result/ResultView";
import { SubmitModal } from "./SubmitModal";
import { ExamHeader } from "./ExamHeader";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import QuestionCard from "../UI/QuestionCard";
import { EmptyMessage } from "../../ui/EmptyMessage";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
}

const DURATION_PER_SUBJECT_SECONDS = 25 * 60;
const HEADER_HEIGHT_PX = 120;

export default function ExamViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
}: Props) {
  const isLoading = useAtomValue(examLoadingAtom);
  const error = useAtomValue(examErrorAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
    const setGroupedQuestions = useSetAtom(groupedQuestionsAtom);
  const setIsLoading = useSetAtom(examLoadingAtom);
  const setError = useSetAtom(examErrorAtom);
  
  // 인증 상태 가져오기
  const auth = useAtomValue(authAtom);
  
  const [showResult, setShowResult] = useAtom(showResultAtom);
  const setGlobalShowResult = useSetAtom(showResultAtom);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const totalDuration = useMemo(
    () => selectedSubjects.length * DURATION_PER_SUBJECT_SECONDS,
    [selectedSubjects.length]
  );

  // 알림 권한 요청
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setShowResult(false);
      setGlobalShowResult(false); // 전역 상태도 초기화
      try {
        const params = new URLSearchParams({
          examtype: "exam", // 시험 모드
          year,
          license,
          level,
          round,
        });
        // 인증 헤더 추가 (선택적)
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        
        // 로그인한 사용자만 인증 헤더 추가
        if (auth.token && auth.isLoggedIn) {
          headers.Authorization = `Bearer ${auth.token}`;
          console.log("로그인한 사용자로 시험 시작", auth);
        } else {
          console.log("비로그인 사용자로 시험 시작");
        }
        
        const res = await fetch(`/api/solve?${params.toString()}`, {
          method: "GET",
          headers,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message ||
              `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`
          );
        }
        const responseData: { qnas: QnaItem[] } = await res.json();
        console.log("Res", responseData);
        const allSubjectGroups = transformData(responseData.qnas);
        if (allSubjectGroups.length === 0) {
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
          setGroupedQuestions([]);
          return;
        }
        const filteredGroups = allSubjectGroups.filter((group) =>
          selectedSubjects.includes(group.subjectName)
        );
        if (filteredGroups.length === 0) {
          setError(
            "선택하신 과목에 해당하는 문제가 없습니다. 과목을 다시 선택해주세요."
          );
        }
        setGroupedQuestions(filteredGroups);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(totalDuration);
        setSelectedSubject(
          filteredGroups.length > 0 ? filteredGroups[0].subjectName : null
        );
      } catch (err: any) {
        setError(err.message);
        setGroupedQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedSubjects.length > 0) fetchData();
  }, [
    year,
    license,
    level,
    round,
    selectedSubjects,
    totalDuration,
    setIsLoading,
    setError,
    setGroupedQuestions,
    setAnswers,
    setCurrentIdx,
    setTimeLeft,
    setSelectedSubject,
    setShowResult,
    setGlobalShowResult,
  ]);

  // 로컬 저장 함수
  const saveToLocalStorage = useCallback((resultData: any) => {
    try {
      const existingResults = JSON.parse(
        localStorage.getItem("examResults") || "[]"
      );
      existingResults.push(resultData);
      localStorage.setItem("examResults", JSON.stringify(existingResults));
    } catch (error) {
      console.error("로컬 저장 실패:", error);
    }
  }, []);

  // 서버 저장 함수
  const saveExamResultToServer = useCallback(async (resultData: any, token: string) => {
    try {
      const response = await fetch("/api/exam/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        throw new Error("서버 저장 실패");
      }

      return await response.json();
    } catch (error) {
      console.error("서버 저장 오류:", error);
      throw error;
    }
  }, []);

  // 자동 제출 함수 추가
  const handleAutoSubmit = useCallback(async () => {
    console.log("시간 만료로 자동 제출됩니다.");

    // 사용자에게 알림
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("시험 시간 만료", {
          body: "시간이 만료되어 답안이 자동으로 제출됩니다.",
          icon: "/favicon.ico",
        });
      }
    }

    // 결과 데이터 생성
    const resultData = {
      answers,
      totalQuestions: allQuestions.length,
      timeTaken: totalDuration - timeLeft,
      submittedAt: new Date().toISOString(),
      isAutoSubmitted: true,
      examInfo: {
        year,
        license,
        level,
        round,
        selectedSubjects,
      },
    };

    // 로그인한 사용자만 결과 저장
    if (auth.token && auth.isLoggedIn) {
      try {
        // 서버에 결과 저장 (로그인한 사용자)
        await saveExamResultToServer(resultData, auth.token);
        console.log("시험 결과가 서버에 저장되었습니다.");
      } catch (error) {
        console.error("서버 저장 실패:", error);
        // 서버 저장 실패 시 로컬에 임시 저장
        saveToLocalStorage(resultData);
      }
    } else {
      // 비로그인 사용자는 로컬에만 임시 저장
      saveToLocalStorage(resultData);
      console.log("비로그인 사용자: 결과가 로컬에 임시 저장되었습니다.");
      
      // 사용자에게 로그인 유도 메시지
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("로그인 권장", {
            body: "로그인하면 시험 결과를 마이페이지에서 확인할 수 있습니다.",
            icon: "/favicon.ico",
          });
        }
      }
    }

    setShowResult(true);
    setGlobalShowResult(true); // 전역 상태도 설정
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [
    setShowResult,
    setGlobalShowResult,
    answers,
    allQuestions.length,
    totalDuration,
    timeLeft,
    year,
    license,
    level,
    round,
    selectedSubjects,
  ]);

  useEffect(() => {
    if (timeLeft <= 0 || showResult) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev > 0 ? prev - 1 : 0;

        // 시간이 만료되면 자동 제출
        if (newTime === 0) {
          handleAutoSubmit();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showResult, setTimeLeft, handleAutoSubmit]);

  useEffect(() => {
    if (currentIdx < 0 || allQuestions.length === 0) return;
    const timer = setTimeout(() => {
      questionRefs.current[currentIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentIdx, allQuestions.length]);

  const handleSubjectChange = (subjectName: string) => {
    const firstQuestionIndex = allQuestions.findIndex(
      (q) => q.subjectName === subjectName
    );
    if (firstQuestionIndex !== -1) {
      setCurrentIdx(firstQuestionIndex);
      setSelectedSubject(subjectName);
    }
  };

  const handleSelectAnswer = (question: Question, choice: string) => {
    setAnswers((prev) => ({
      ...prev,
      [`${question.subjectName}-${question.num}`]: choice,
    }));
  };

  const handleConfirmSubmit = useCallback(() => {
    setIsSubmitModalOpen(false);
    setShowResult(true);
    setGlobalShowResult(true); // 전역 상태도 설정
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [setIsSubmitModalOpen, setShowResult, setGlobalShowResult]);

  const handleRetry = () => {
    setShowResult(false);
    setGlobalShowResult(false); // 전역 상태도 초기화
    setCurrentIdx(0);
    setTimeLeft(totalDuration);
    setAnswers({});
    if (groupedQuestions.length > 0) {
      setSelectedSubject(groupedQuestions[0].subjectName);
    }
  };

  const subjectNames = useMemo(
    () => groupedQuestions.map((g) => g.subjectName),
    [groupedQuestions]
  );

  const currentQuestions = useMemo(
    () =>
      groupedQuestions.find((g) => g.subjectName === selectedSubject)
        ?.questions || [],
    [groupedQuestions, selectedSubject]
  );

  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <p className="text-gray-400 animate-pulse">
          시험 문제를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-[#0f172a] flex items-center justify-center">
        <EmptyMessage message={error} />
      </div>
    );
  }

  if (selectedSubjects.length === 0 && !isLoading) {
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
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a]">
      {isSubmitModalOpen && (
        <SubmitModal
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsSubmitModalOpen(false)}
          totalCount={allQuestions.length}
          answeredCount={Object.keys(answers).length}
        />
      )}

      <ExamHeader
        subjectNames={subjectNames}
        onSubjectChange={handleSubjectChange}
      />

      <div ref={mainScrollRef} className="flex-1 overflow-y-auto">
        <main className="max-w-3xl w-full mx-auto px-4 pb-10">
          {currentQuestions.map((q) => {
            const globalIndex = allQuestions.findIndex(
              (item) =>
                `${item.subjectName}-${item.num}` ===
                `${q.subjectName}-${q.num}`
            );
            return (
              <div
                key={`${q.subjectName}-${q.num}`}
                ref={(el) => {
                  if (questionRefs.current)
                    questionRefs.current[globalIndex] = el;
                }}
                style={{ scrollMarginTop: HEADER_HEIGHT_PX }}
                className="py-4"
              >
                <QuestionCard
                  question={q}
                  selected={answers[`${q.subjectName}-${q.num}`]}
                  showAnswer={false}
                  onSelect={(choice) => handleSelectAnswer(q, choice)}
                />
              </div>
            );
          })}

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              variant="neutral"
              onClick={() =>
                handleSubjectChange(subjectNames[selectedIndex - 1])
              }
              disabled={selectedIndex <= 0}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
            </Button>
            {selectedIndex === subjectNames.length - 1 ? (
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                variant="primary"
                className="w-full sm:w-auto"
              >
                제출하기 <Send className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleSubjectChange(subjectNames[selectedIndex + 1])
                }
                className="w-full sm:w-auto"
              >
                다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </main>
      </div>

      <ScrollToTopButton scrollableRef={mainScrollRef} />
    </div>
  );
}
