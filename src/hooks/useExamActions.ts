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
import { OneResult, saveManyUserAnswers } from "@/lib/wrongNoteApi";

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
    // 시간이 만료되어 자동 제출될 경우 브라우저 알림을 보냄
    if (isAutoSubmitted && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission === "granted") {
        new Notification("시험 시간 만료", {
          body: "시간이 만료되어 답안이 자동으로 제출됩니다.",
          icon: "/favicon.ico",
        });
      }
    }
    
    // 실제 시험 시간 계산 (총 시간 - 남은 시간)
    const actualTimeTaken = totalDuration - timeLeft;
    
    // 서버에 저장할 오답 노트 목록을 생성
    const wrongNotes: OneResult[] = allQuestions
      .map((q) => {
        const userChoice = answers[`${q.subjectName}-${q.num}`];
        // 사용자가 선택했고, 그 선택이 정답이 아닌 경우에만 오답으로 간주
        if (userChoice && userChoice !== q.answer) {
          return { 
            choice: userChoice as "가" | "나" | "사" | "아", 
            gichulqna_id: q.id,
            answer: q.answer
          };
        }
        return null;
      })
              .filter((note): note is OneResult => note !== null);

    // 로그인 상태이고, 유효한 토큰과 odapsetId가 있으며, 저장할 오답이 1개 이상일 경우에만 서버에 요청
    if (isLoggedIn && token && odapsetId && wrongNotes.length > 0) {
      try {
        console.log(`[Exam Action] 오답노트 ${wrongNotes.length}개를 서버에 저장합니다... (odapsetId: ${odapsetId}, 소요시간: ${actualTimeTaken}초)`);
        await saveManyUserAnswers(wrongNotes, odapsetId, token, actualTimeTaken);
        console.log("[Exam Action] 오답노트 저장 성공!");
      } catch (e) {
        console.error("[Exam Action] 오답노트 저장 중 서버 에러 발생:", e);
      }
    }

    setShowResult(true);
    
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
    
  }, [
    answers, 
    allQuestions, 
    totalDuration, 
    timeLeft, 
    examInfo, 
    isLoggedIn, 
    token, 
    odapsetId, 
    setShowResult, 
    scrollRef
  ]);

  const handleRetry = useCallback(() => {
    // 결과 화면 표시 상태를 false로 변경
    setShowResult(false);
    // 현재 문제 인덱스를 처음으로 리셋
    setCurrentIdx(0);
    // 그룹화된 문제가 있을 경우, 첫 번째 과목을 선택된 과목으로 설정
    if (groupedQuestions.length > 0) {
      setSelectedSubject(groupedQuestions[0].subjectName);
    }
    // 남은 시간을 총 시험 시간으로 리셋
    setTimeLeft(totalDuration);
    // 사용자가 선택한 답안들을 모두 초기화
    setAnswers({});
  }, [groupedQuestions, totalDuration, setShowResult, setCurrentIdx, setSelectedSubject, setTimeLeft, setAnswers]);
  
  return { handleSubmit, handleRetry };
}