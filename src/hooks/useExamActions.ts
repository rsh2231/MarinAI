import { useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { 
  answersAtom, 
  allQuestionsAtom, 
  timeLeftAtom, 
  showResultAtom,
  currentQuestionIndexAtom,
  selectedSubjectAtom,
  groupedQuestionsAtom,
} from '@/atoms/examAtoms';
import { authAtom } from '@/atoms/authAtom';
import { saveExamResultToServer, saveWrongNotes, saveExamResultToLocal } from '@/lib/examApi';
import { OneOdap } from "@/lib/wrongNoteApi";

interface ExamInfo {
  year: string;
  license: string;
  level: string;
  round: string;
  selectedSubjects: string[];
}

export function useExamActions(
    examInfo: ExamInfo, 
    odapsetId: number | null, 
    totalDuration: number,
    scrollRef: React.RefObject<HTMLDivElement | null>
) {
  const { token, isLoggedIn } = useAtomValue(authAtom);
  const answers = useAtomValue(answersAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const timeLeft = useAtomValue(timeLeftAtom);
  const setShowResult = useSetAtom(showResultAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);
  const setAnswers = useSetAtom(answersAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);

  const handleSubmit = useCallback(async ({ isAutoSubmitted = false } = {}) => {
    if (isAutoSubmitted && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission === "granted") {
        new Notification("시험 시간 만료", {
          body: "시간이 만료되어 답안이 자동으로 제출됩니다.",
          icon: "/favicon.ico",
        });
      }
    }
    
    const resultData = {
      answers,
      totalQuestions: allQuestions.length,
      timeTaken: totalDuration - timeLeft,
      submittedAt: new Date().toISOString(),
      isAutoSubmitted,
      examInfo,
    };
    
    const wrongNotes: OneOdap[] = allQuestions
      .map((q) => {
        const userChoice = answers[`${q.subjectName}-${q.num}`];
        if (userChoice && userChoice !== q.answer) {
          return { choice: userChoice as "가" | "나" | "사" | "아", gichulqna_id: q.id };
        }
        return null;
      })
      .filter((note): note is OneOdap => note !== null);

    if (isLoggedIn && token) {
      try {
        await saveExamResultToServer(resultData, token);
        if (odapsetId && wrongNotes.length > 0) {
          await saveWrongNotes(wrongNotes, odapsetId, token);
        }
      } catch (error) {
        console.error("서버 저장 실패, 로컬에 저장합니다:", error);
        saveExamResultToLocal(resultData);
      }
    } else {
      saveExamResultToLocal(resultData);
    }

    setShowResult(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [
    answers, allQuestions, totalDuration, timeLeft, examInfo, 
    isLoggedIn, token, odapsetId, setShowResult, scrollRef
  ]);

  const handleRetry = useCallback(() => {
    setShowResult(false);
    setCurrentIdx(0);
    if (groupedQuestions.length > 0) {
      setSelectedSubject(groupedQuestions[0].subjectName);
    }
    setTimeLeft(totalDuration);
    setAnswers({});
  }, [groupedQuestions, totalDuration, setShowResult, setCurrentIdx, setSelectedSubject, setTimeLeft, setAnswers]);
  
  return { handleSubmit, handleRetry };
}