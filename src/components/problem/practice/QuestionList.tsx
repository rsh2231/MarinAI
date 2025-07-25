import QuestionCard from "../UI/QuestionCard";
import { Question } from "@/types/ProblemViewer";

interface QuestionListProps {
  questions: Question[];
  answers: Record<number, string>;
  showAnswer: Record<number, boolean>;
  onSelect: (questionId: number, choice: string) => void;
  onToggle: (question: Question) => void;
}

export default function QuestionList({
  questions,
  answers,
  showAnswer,
  onSelect,
  onToggle,
}: QuestionListProps) {
  return (
    <>
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          selected={answers[q.id]}
          showAnswer={!!showAnswer[q.id]}
          onSelect={(choice) => onSelect(q.id, choice)}
          onToggle={() => onToggle(q)}
        />
      ))}
    </>
  );
} 