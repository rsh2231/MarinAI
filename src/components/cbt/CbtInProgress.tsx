"use client";

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  RefObject,
} from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import {
  answersAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  allQuestionsAtom,
  currentQuestionIndexAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { Question } from "@/types/ProblemViewer";

import Button from "@/components/ui/Button";
import QuestionCard from "@/components/problem/UI/QuestionCard";
import { SubmitModal } from "@/components/problem/exam/SubmitModal";
import { ExamHeader } from "@/components/problem/exam/ExamHeader";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { EmptyMessage } from "../ui/EmptyMessage";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import { OneOdap, saveManyUserAnswers } from "@/lib/wrongNoteApi";

interface CbtInProgressProps {
  onSubmit: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  license: "기관사" | "항해사" | "소형선박조종사" | null;
  level: string;
  odapsetId: number | null;
}

const HEADER_HEIGHT_PX = 120;

export function CbtInProgress({
  onSubmit,
  scrollRef,
  license,
  level,
  odapsetId,
}: CbtInProgressProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const groupedData = useAtomValue(groupedQuestionsAtom);
  const allQuestionsData = useAtomValue(allQuestionsAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const currentIdx = useAtomValue(currentQuestionIndexAtom);

  // 인증 상태 가져오기
  const auth = useAtomValue(authAtom);

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timerId);
  }, [timeLeft, setTimeLeft]);

  useEffect(() => {
    if (currentIdx < 0 || allQuestionsData.length === 0) return;

    const timer = setTimeout(() => {
      if (questionRefs.current[currentIdx]) {
        questionRefs.current[currentIdx]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentIdx, allQuestionsData.length]);

  const handleSelectAnswer = (question: Question, choice: string) => {
    setAnswers((prev) => ({
      ...prev,
      [`${question.subjectName}-${question.num}`]: choice,
    }));
  };

  const onSelectSubject = useCallback(
    (subjectName: string) => {
      if (!subjectName) return;
      const firstQuestionIndex = allQuestionsData.findIndex(
        (q) => q.subjectName === subjectName
      );
      if (firstQuestionIndex !== -1) {
        setCurrentIdx(firstQuestionIndex);
        setSelectedSubject(subjectName);
      }
    },
    [allQuestionsData, setCurrentIdx, setSelectedSubject]
  );

  const subjectNames = useMemo(
    () => groupedData.map((g) => g.subjectName),
    [groupedData]
  );

  const currentQuestions = useMemo(() => {
    if (!selectedSubject) return [];
    return (
      groupedData.find((group) => group.subjectName === selectedSubject)
        ?.questions || []
    );
  }, [groupedData, selectedSubject]);

  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  // 로컬 저장 함수
  const saveToLocalStorage = useCallback((resultData: any) => {
    try {
      const existingResults = JSON.parse(
        localStorage.getItem("cbtResults") || "[]"
      );
      existingResults.push(resultData);
      localStorage.setItem("cbtResults", JSON.stringify(existingResults));
    } catch (error) {
      console.error("로컬 저장 실패:", error);
    }
  }, []);

  // 서버 저장 함수
  const saveCbtResultToServer = useCallback(
    async (resultData: any, token: string) => {
      try {
        const response = await fetch("/api/cbt/result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
    },
    []
  );

  const handleConfirmSubmit = useCallback(async () => {
    setIsModalOpen(false);

    // 결과 데이터 생성
    const resultData = {
      answers,
      totalQuestions: allQuestionsData.length,
      timeTaken: 0, // CBT는 시간 제한이 없으므로 0
      submittedAt: new Date().toISOString(),
      isAutoSubmitted: false,
      cbtInfo: {
        license: license || "항해사",
        level: level,
        subjects: subjectNames,
      },
    };

    // 오답만 추출
    const wrongNotes: OneOdap[] = allQuestionsData
      .map((q) => {
        const key = `${q.subjectName}-${q.num}`;
        const userChoice = answers[key];
        if (userChoice && userChoice !== q.answer) {
          return {
            choice: userChoice as "가" | "나" | "사" | "아",
            gichulqna_id: q.id,
          };
        }
        return null;
      })
      .filter((note): note is OneOdap => note !== null);

    // 결과 저장 (실패해도 오답노트 저장은 항상 시도)
    if (auth.token && auth.isLoggedIn) {
      try {
        await saveCbtResultToServer(resultData, auth.token);
      } catch (error) {
        console.error("서버 저장 실패:", error);
        saveToLocalStorage(resultData);
      }
      // 오답노트 저장은 항상 시도
      if (odapsetId && wrongNotes.length > 0) {
        try {
          await saveManyUserAnswers(wrongNotes, odapsetId, auth.token);
          console.log("오답노트가 서버에 저장되었습니다.");
        } catch (error) {
          console.error("오답노트 저장 실패:", error);
        }
      }
      console.log("CBT 결과 저장 시도 완료");
    } else {
      // 비로그인 사용자는 로컬에만 임시 저장
      saveToLocalStorage(resultData);
      console.log("비로그인 사용자: CBT 결과가 로컬에 임시 저장되었습니다.");
      // 사용자에게 로그인 유도 메시지
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("로그인 권장", {
            body: "로그인하면 CBT 결과를 마이페이지에서 확인할 수 있습니다.",
            icon: "/favicon.ico",
          });
        }
      }
    }

    onSubmit();
  }, [
    answers,
    allQuestionsData,
    license,
    level,
    subjectNames,
    auth.token,
    auth.isLoggedIn,
    odapsetId,
    saveCbtResultToServer,
    saveToLocalStorage,
    onSubmit,
  ]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a]">
      {isModalOpen && (
        <SubmitModal
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsModalOpen(false)}
          totalCount={allQuestionsData.length}
          answeredCount={Object.keys(answers).length}
        />
      )}

      <ExamHeader
        subjectNames={subjectNames}
        onSubjectChange={onSelectSubject}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <main className="max-w-3xl w-full mx-auto px-4 pb-10">
          {currentQuestions.map((q) => {
            const globalIndex = allQuestionsData.findIndex(
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
                  onSelect={(choice) => handleSelectAnswer(q, choice)}
                  showAnswer={false}
                />
              </div>
            );
          })}

          {currentQuestions.length === 0 && (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <EmptyMessage message="문제를 불러오는 중이거나, 선택된 과목에 문제가 없습니다." />
            </div>
          )}

          {groupedData.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                variant="neutral"
                onClick={() => onSelectSubject(subjectNames[selectedIndex - 1])}
                disabled={selectedIndex <= 0}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
              </Button>
              {selectedIndex === subjectNames.length - 1 ? (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  제출하기 <Send className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    onSelectSubject(subjectNames[selectedIndex + 1])
                  }
                  className="w-full sm:w-auto"
                >
                  다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </main>
      </div>

      <ScrollToTopButton scrollableRef={scrollRef} />
    </div>
  );
}
