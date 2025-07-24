import React from "react";
import { ProblemReviewHeader } from "./ProblemReviewHeader";
import { QuestionResultCard } from "./QuestionResultCard";
import { EmptyMessage } from "@/components/ui/EmptyMessage";
import { BookOpen } from "lucide-react";
import { Question } from "@/types/ProblemViewer";
import { SubjectResult } from "./ResultView";

interface Props {
  filteredQuestions: Question[];
  renderCount: number;
  selectedSubject: string;
  subjectResults: SubjectResult[];
  showOnlyWrong: boolean;
  setShowOnlyWrong: (v: boolean) => void;
  setSelectedSubject: (v: string) => void;
  onRetry: () => void;
  answers: Record<string, string>;
}

export default function ResultProblemList({
  filteredQuestions,
  renderCount,
  selectedSubject,
  subjectResults,
  showOnlyWrong,
  setShowOnlyWrong,
  setSelectedSubject,
  onRetry,
  answers,
}: Props) {
  let lastSubject: string | null = null;
  return (
    <div className="space-y-6">
      <ProblemReviewHeader
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        showOnlyWrong={showOnlyWrong}
        setShowOnlyWrong={setShowOnlyWrong}
        onRetry={onRetry}
        subjectNames={subjectResults.map((r) => r.subjectName)}
      />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.slice(0, renderCount).map((question, index) => {
            const showDivider =
              selectedSubject === "all" &&
              (lastSubject === null || lastSubject !== question.subjectName);
            const card = (
              <QuestionResultCard
                key={`${question.subjectName}-${question.num}`}
                question={question}
                userAnswer={answers[`${question.subjectName}-${question.num}`]}
                index={index}
              />
            );
            const divider = showDivider ? (
              <div
                key={`divider-${question.subjectName}-${question.num}`}
                className="col-span-full border-t border-neutral-700/70 my-12 flex items-center gap-3"
              >
                <span className="inline-flex items-center gap-2 text-base md:text-lg font-semibold tracking-tight px-4 py-1 rounded-full text-white shadow-none backdrop-blur-sm">
                  <BookOpen size={18} />
                  {question.subjectName}
                </span>
              </div>
            ) : null;
            lastSubject = question.subjectName;
            return (
              <React.Fragment key={`${question.subjectName}-${question.num}`}>
                {divider}
                {card}
              </React.Fragment>
            );
          })
        ) : (
          <div className="flex md:col-span-2 justify-center items-center ">
            <EmptyMessage message="해당 조건에 맞는 문제가 없습니다." />
          </div>
        )}
      </div>
    </div>
  );
} 