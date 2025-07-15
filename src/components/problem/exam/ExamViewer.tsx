"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  selectedSubjectAtom,
  examLoadingAtom,
  examErrorAtom,
  groupedQuestionsAtom,
  allQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  timeLeftAtom,
  isOmrVisibleAtom,
} from "@/atoms/examAtoms";

import { QnaItem, Question } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";

import ViewerCore from "../UI/ViewerCore";
import QuestionCard from "../UI/QuestionCard";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, List, Send, Timer } from "lucide-react";
import { OmrSheet } from "@/components/problem/exam/OmrSheet";
import { ResultView } from "../UI/ResultView";
import { SubmitModal } from "./SubmitModal";
import { EmptyMessage } from "../../ui/EmptyMessage";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
  durationSeconds?: number;
}

export default function ExamViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
  durationSeconds = 3600,
}: Props) {
  // Jotai Atoms
  const [isLoading, setIsLoading] = useAtom(examLoadingAtom);
  const [error, setError] = useAtom(examErrorAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const [groupedQuestions, setGroupedQuestions] = useAtom(groupedQuestionsAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [, setIsOmrVisible] = useAtom(isOmrVisibleAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);

  // Component State & Hooks
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 데이터 로딩 로직 (Jotai 상태와 결합)
  useEffect(() => {
    const fetchData = async () => {
      // 초기화 로직
      setIsLoading(true);
      setError(null);
      setIsSubmitted(false);

      try {
        const params = new URLSearchParams({ year, license, level, round });
        const res = await fetch(`/api/solve?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message ||
              `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`
          );
        }
        const responseData: { qnas: QnaItem[] } = await res.json();
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

        // Jotai atom 상태 업데이트
        setGroupedQuestions(filteredGroups);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(durationSeconds);
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

    fetchData();
  }, [
    year,
    license,
    level,
    round,
    selectedSubjects,
    durationSeconds,
    setIsLoading,
    setError,
    setGroupedQuestions,
    setAnswers,
    setCurrentIdx,
    setTimeLeft,
    setSelectedSubject,
  ]);

  // 타이머 로직
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timerId = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, setTimeLeft]);
  
  const navigateToQuestion = (
    targetIndex: number,
    options: { shouldScrollToTop?: boolean } = {}
  ) => {
    if (targetIndex < 0 || targetIndex >= allQuestions.length) return;

    const question = allQuestions[targetIndex];
    if (!question) return;

    setCurrentIdx(targetIndex);
    setSelectedSubject(question.subjectName);

    if (options.shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  useEffect(() => {
    if (allQuestions.length === 0 || currentIdx >= allQuestions.length) return;
    setTimeout(() => {
      questionRefs.current[currentIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, [currentIdx, allQuestions.length]);

  // 핸들러 함수
  const handleSubjectChange = (subjectName: string) => {
    const firstQuestionIndex = allQuestions.findIndex(
      (q) => q.subjectName === subjectName
    );
    if (firstQuestionIndex !== -1) {
      // 과목 변경 시에는 페이지 상단으로 스크롤
      navigateToQuestion(firstQuestionIndex, { shouldScrollToTop: true });
    }
  };

  const handleSelectAnswer = (question: Question, choice: string) => {
    const key = `${question.subjectName}-${question.num}`;
    setAnswers((prev) => ({ ...prev, [key]: choice }));
    // navigateToQuestion(globalIndex) 호출을 제거하여 스크롤 방지
  };

  // OMR 시트에서 문항을 선택했을 때 호출되는 함수. 의도된 스크롤
  const handleQuestionSelectFromOMR = (question: Question, index: number) => {
    navigateToQuestion(index);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "auto" }); // 제출 후에는 맨 위로
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(durationSeconds);
    setAnswers({});
    if (groupedQuestions.length > 0) {
      setSelectedSubject(groupedQuestions[0].subjectName);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 렌더링 로직
  if (isSubmitted) {
    const totalCount = allQuestions.length;
    const correctCount = allQuestions.filter(
      (q) => answers[`${q.subjectName}-${q.num}`] === q.answer
    ).length;
    return (
      <ResultView
        total={totalCount}
        correct={correctCount}
        onRetry={handleRetry}
      />
    );
  }

  if (selectedSubjects.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <EmptyMessage message="선택한 과목에 해당하는 문제가 없습니다. 사이드바에서 과목을 선택해주세요." />
      </div>
    );
  }

  const subjectNames = groupedQuestions.map((g) => g.subjectName);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);
  const isLastSubject = selectedIndex === subjectNames.length - 1;
  const selectedBlock = groupedQuestions.find(
    (g) => g.subjectName === selectedSubject
  );

  return (
    <>
      <OmrSheet onSelectQuestion={handleQuestionSelectFromOMR} />
      {isSubmitModalOpen && (
        <SubmitModal
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsSubmitModalOpen(false)}
          totalCount={allQuestions.length}
          answeredCount={Object.keys(answers).length}
        />
      )}

      <ViewerCore
        isLoading={isLoading}
        error={error}
        filteredSubjects={groupedQuestions}
        selectedSubject={selectedSubject}
        onSelectSubject={handleSubjectChange}
        headerContent={
          <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 flex items-center justify-between">
            <div className="flex items-center bg-blue-600 text-white font-mono text-sm px-3 py-1 rounded-full shadow-md animate-pulse">
              <Timer className="w-4 h-4 mr-1.5" />{" "}
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => setIsOmrVisible(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-gray-700 text-white text-sm rounded-full shadow-md hover:bg-gray-600"
            >
              <List className="w-4 h-4" /> <span>OMR</span>
            </button>
          </div>
        }
        footerContent={
          <>
            <Button
              variant="neutral"
              onClick={() =>
                handleSubjectChange(subjectNames[selectedIndex - 1])
              }
              disabled={selectedIndex <= 0}
              className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
            </Button>
            {isLastSubject ? (
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                variant="primary"
                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
              >
                제출하기 <Send className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleSubjectChange(subjectNames[selectedIndex + 1])
                }
                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
              >
                다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </>
        }
      >
        {selectedBlock?.questions.map((q) => {
          const globalIndex = allQuestions.findIndex(
            (item) =>
              `${item.subjectName}-${item.num}` === `${q.subjectName}-${q.num}`
          );
          return (
            <div
              key={`${q.subjectName}-${q.num}`}
              ref={(el) => {
                if (globalIndex !== -1) questionRefs.current[globalIndex] = el;
              }}
            >
              <QuestionCard
                question={q}
                selected={answers[`${q.subjectName}-${q.num}`]}
                showAnswer={false} // 시험 모드에서는 정답 비공개
                onSelect={(choice) => handleSelectAnswer(q, choice)}
              />
            </div>
          );
        })}
      </ViewerCore>
    </>
  );
}
