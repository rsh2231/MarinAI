"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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

interface CbtInProgressProps {
  onSubmit: () => void;
}

const HEADER_HEIGHT_PX = 120;

export function CbtInProgress({ onSubmit }: CbtInProgressProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const groupedData = useAtomValue(groupedQuestionsAtom);
  const allQuestionsData = useAtomValue(allQuestionsAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const currentIdx = useAtomValue(currentQuestionIndexAtom);

  const mainScrollRef = useRef<HTMLDivElement>(null);
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
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  const handleConfirmSubmit = () => {
    setIsModalOpen(false);
    onSubmit();
  };

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

      <div ref={mainScrollRef} className="flex-1 overflow-y-auto">
        <main className="max-w-3xl w-full mx-auto px-4 pb-10">
          {/* 모든 과목 그룹을 렌더링하고, 선택된 과목만 보여줍니다. */}
          {groupedData.map((group) => (
            <div
              key={group.subjectName}
              className={
                group.subjectName === selectedSubject ? "block" : "hidden"
              }
            >
              {group.questions.map((q) => {
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
            </div>
          ))}

          {groupedData.length === 0 && (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <EmptyMessage />
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

      <ScrollToTopButton scrollableRef={mainScrollRef} />
    </div>
  );
}
