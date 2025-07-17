"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  examLoadingAtom,
  examErrorAtom,
  timeLeftAtom,
  selectedSubjectAtom,
  groupedQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  allQuestionsAtom,
} from "@/atoms/examAtoms";

import { QnaItem, Question } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";

import { ResultView } from "../UI/ResultView";
import { SubmitModal } from "./SubmitModal";
import { EmptyMessage } from "../../ui/EmptyMessage";
import { ExamHeader } from "./ExamHeader";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import QuestionCard from "../UI/QuestionCard";

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

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const totalDuration = useMemo(
    () => selectedSubjects.length * DURATION_PER_SUBJECT_SECONDS,
    [selectedSubjects.length]
  );

  useEffect(() => {
    const fetchData = async () => {
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
  ]);

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timerId = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, setTimeLeft]);

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

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleRetry = () => {
    setIsSubmitted(false);
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
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 animate-pulse">
          시험 문제를 불러오는 중입니다...
        </p>
      </div>
    );
  }
  if (error) return <EmptyMessage message={error} />;
  if (selectedSubjects.length === 0 && !isLoading)
    return <EmptyMessage message="풀이할 과목을 선택해주세요." />;
  if (isSubmitted) {
    const correctCount = allQuestions.filter(
      (q) => answers[`${q.subjectName}-${q.num}`] === q.answer
    ).length;
    return (
      <ResultView
        total={allQuestions.length}
        correct={correctCount}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
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

      <div
        ref={mainScrollRef}
        className="flex-1 overflow-y-auto"
      >
        <main className="max-w-3xl w-full mx-auto px-4 pb-10 flex-1">
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
        </main>
      </div>

      <div className="sticky bottom-0 z-20 w-full bg-[#1e293b]/80 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex justify-center items-center gap-4">
          <Button
            variant="neutral"
            onClick={() =>
              handleSubjectChange(subjectNames[selectedIndex - 1])
            }
            disabled={selectedIndex <= 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
          </Button>
          {selectedIndex === subjectNames.length - 1 ? (
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              variant="primary"
            >
              제출하기 <Send className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() =>
                handleSubjectChange(subjectNames[selectedIndex + 1])
              }
            >
              다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}