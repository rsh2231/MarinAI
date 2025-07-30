import { useState, useCallback, useRef, useEffect } from "react";
import { saveUserAnswer } from "@/lib/wrongNoteApi";
import { SubjectGroup, Question } from "@/types/ProblemViewer";

interface UseAnswerStateParams {
  subjectGroups: SubjectGroup[];
  odapsetId: number | null;
  auth: { token?: string; isLoggedIn?: boolean };
}

export function useAnswerState({
  subjectGroups,
  odapsetId,
  auth,
}: UseAnswerStateParams) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 디바운싱된 답안 저장 함수
  const debouncedSaveAnswer = useCallback(
    async (questionId: number, choice: string, correctAnswer: string) => {
      const isCorrect = choice === correctAnswer;
      console.log("[연습모드 답안 저장]", {
        questionId,
        userChoice: choice,
        correctAnswer,
        isCorrect,
        odapsetId
      });
      
      if (auth.token && auth.isLoggedIn && odapsetId !== null) {
        try {
          await saveUserAnswer(questionId, choice, odapsetId, auth.token, correctAnswer);
          console.log("[연습모드 답안 저장 성공]", { questionId, choice, correctAnswer, isCorrect });
        } catch (error) {
          console.error("서버 저장 실패:", error);
        }
      }
    },
    [auth.token, auth.isLoggedIn, odapsetId]
  );

  const handleSelectAnswer = useCallback(
    (questionId: number, choice: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: choice }));
      let foundQuestion: Question | undefined;
      for (const group of subjectGroups) {
        const q = group.questions.find((q) => q.id === questionId);
        if (q) {
          foundQuestion = q;
          break;
        }
      }
      if (foundQuestion) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          debouncedSaveAnswer(questionId, choice, foundQuestion.answer);
        }, 1000);
      }
    },
    [debouncedSaveAnswer, subjectGroups]
  );



  const toggleAnswer = useCallback((question: Question) => {
    const isNowShowing = !showAnswer[question.id];
    setShowAnswer((prev) => ({ ...prev, [question.id]: isNowShowing }));
  }, [showAnswer]);

  return {
    answers,
    showAnswer,
    handleSelectAnswer,
    toggleAnswer,
    setAnswers,
    setShowAnswer,
  };
} 