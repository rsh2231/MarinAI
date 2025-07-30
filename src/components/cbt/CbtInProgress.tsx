"use client";

import { RefObject } from "react";
import { useCbtInProgress } from "@/hooks/useCbtInProgress";
import { LicenseType } from "@/types/common";

import Button from "@/components/ui/Button";
import QuestionCard from "@/components/problem/UI/QuestionCard";
import { SubmitModal } from "@/components/problem/UI/SubmitModal";
import { ExamHeader } from "@/components/problem/exam/ExamHeader";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { EmptyMessage } from "../ui/EmptyMessage";
import ScrollToTopButton from "../ui/ScrollToTopButton";

export interface CbtInProgressProps {
  onSubmit: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  license: LicenseType | null;
  level: string;
  odapsetId: number | null;
}

export function CbtInProgress({
  onSubmit,
  scrollRef,
  license,
  level,
  odapsetId,
}: CbtInProgressProps) {
  const {
    isModalOpen,
    setIsModalOpen,
    answers,
    handleSelectAnswer,
    groupedData,
    allQuestionsData,
    questionRefs,
    onSelectSubject,
    subjectNames,
    currentQuestions,
    selectedIndex,
    handleConfirmSubmit,
  } = useCbtInProgress(license, level, odapsetId, onSubmit);

  const HEADER_HEIGHT_PX = 120;

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
            <div className="mt-8 flex flex-row justify-center items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={() => {
                  if (selectedIndex > 0) {
                    onSelectSubject(subjectNames[selectedIndex - 1]);
                  }
                }}
                disabled={selectedIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전 과목
              </Button>

              <span className="text-gray-400 text-sm">
                {selectedIndex + 1} / {subjectNames.length}
              </span>

              {selectedIndex === subjectNames.length - 1 ? (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  제출하기
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (selectedIndex < subjectNames.length - 1) {
                      onSelectSubject(subjectNames[selectedIndex + 1]);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  다음 과목
                  <ChevronRight className="w-4 h-4" />
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
