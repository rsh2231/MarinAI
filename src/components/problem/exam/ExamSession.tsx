"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react"; 
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  selectedSubjectAtom,
  groupedQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  allQuestionsAtom,
  selectedQuestionFromOmrAtom,
} from "@/atoms/examAtoms";

import { Question } from "@/types/ProblemViewer";
import { SubmitModal } from "../UI/SubmitModal";
import { ExamHeader } from "./ExamHeader";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import QuestionCard from "../UI/QuestionCard";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

const HEADER_HEIGHT_PX = 120;

interface ExamSessionProps {
  onSubmit: (options?: { isAutoSubmitted?: boolean }) => Promise<void>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ExamSession({ onSubmit, scrollRef }: ExamSessionProps) {
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom); 
  const allQuestions = useAtomValue(allQuestionsAtom);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedFromOmr, setSelectedFromOmr] = useAtom(selectedQuestionFromOmrAtom);

  useEffect(() => {
    if (selectedFromOmr !== null && questionRefs.current[selectedFromOmr]) {
      questionRefs.current[selectedFromOmr]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setSelectedFromOmr(null);
    }
  }, [selectedFromOmr, setSelectedFromOmr]);

  // 헤더에서 과목을 변경하는 핸들러
  const handleSubjectChange = useCallback((subjectName: string) => {
    setSelectedSubject(subjectName);
    const firstQuestionIndex = allQuestions.findIndex(
      (q) => q.subjectName === subjectName
    );
    if (firstQuestionIndex !== -1) {
      setCurrentIdx(firstQuestionIndex);

      setTimeout(() => {
        questionRefs.current[firstQuestionIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
      }, 50); 
    }
  }, [allQuestions, setCurrentIdx, setSelectedSubject ]);

  const handleSelectAnswer = (question: Question, choice: string) => {
    setAnswers((prev) => ({
      ...prev,
      [`${question.subjectName}-${question.num}`]: choice,
    }));
  };

  const handleConfirmSubmit = useCallback(() => {
    setIsSubmitModalOpen(false);
    onSubmit();
  }, [onSubmit]);

  const subjectNames = useMemo(
    () => groupedQuestions.map((g) => g.subjectName),
    [groupedQuestions]
  );

  const currentQuestions = useMemo(
    () =>
      groupedQuestions.find((g) => g.subjectName === selectedSubject)?.questions || [],
    [groupedQuestions, selectedSubject]
  );
  
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

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

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <main className="max-w-3xl w-full mx-auto px-4 pb-10">
          {currentQuestions.map((q) => {
            const globalIndex = allQuestions.findIndex(
              (item) => item.id === q.id
            );
            return (
              <div
                key={q.id}
                ref={(el) => {
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

          <div className="mt-8 flex flex-row justify-center items-center gap-4">
            <Button
              variant="neutral"
              onClick={() => handleSubjectChange(subjectNames[selectedIndex - 1])}
              disabled={selectedIndex <= 0}
              className="w-auto"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
            </Button>

            {selectedIndex === subjectNames.length - 1 ? (
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                variant="primary"
                className="w-auto"
              >
                제출하기 <Send className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSubjectChange(subjectNames[selectedIndex + 1])}
                className="w-auto"
              >
                다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </main>
      </div>

      <ScrollToTopButton scrollableRef={scrollRef} />
    </div>
  );
}