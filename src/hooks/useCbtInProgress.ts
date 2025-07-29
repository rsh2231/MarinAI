import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import {
  answersAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  allQuestionsAtom,
  currentQuestionIndexAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { Question, SubjectGroup } from "@/types/ProblemViewer";
import { OneResult, saveManyUserAnswers } from "@/lib/wrongNoteApi";
import { saveCbtResultToServer } from "@/lib/examApi";

export interface UseCbtInProgressReturn {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  answers: Record<string, string>;
  handleSelectAnswer: (question: Question, choice: string) => void;
  selectedSubject: string | null;
  setSelectedSubject: (subject: string | null) => void;
  groupedData: SubjectGroup[];
  allQuestionsData: Question[];
  setCurrentIdx: (idx: number) => void;
  timeLeft: number;
  setTimeLeft: (t: number) => void;
  currentIdx: number;
  questionRefs: React.RefObject<(HTMLDivElement | null)[]>;
  onSelectSubject: (subjectName: string) => void;
  subjectNames: string[];
  currentQuestions: Question[];
  selectedIndex: number;
  handleConfirmSubmit: () => Promise<void>;
  totalDuration: number;
}

export function useCbtInProgress(
  license: string | null,
  level: string,
  odapsetId: number | null,
  onSubmit: () => void
): UseCbtInProgressReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [selectedSubject, setSelectedSubject] = useAtom<string | null>(selectedSubjectAtom);
  const groupedData = useAtomValue<SubjectGroup[]>(groupedQuestionsAtom);
  const allQuestionsData = useAtomValue<Question[]>(allQuestionsAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const currentIdx = useAtomValue(currentQuestionIndexAtom);
  const auth = useAtomValue(authAtom);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 총 시험 시간 계산 (과목당 25분)
  const totalDuration = useMemo(() => {
    const DURATION_PER_SUBJECT_SECONDS = 25 * 60;
    return groupedData.length * DURATION_PER_SUBJECT_SECONDS;
  }, [groupedData.length]);

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
      if (!subjectName) return;
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

  const currentQuestions = useMemo(() => {
    if (!selectedSubject) return [];
    return (
      groupedData.find((group) => group.subjectName === selectedSubject)
        ?.questions || []
    );
  }, [groupedData, selectedSubject]);

  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  const handleConfirmSubmit = useCallback(async () => {
    setIsModalOpen(false);
    
    // 실제 시험 시간 계산 (총 시간 - 남은 시간)
    const actualTimeTaken = timeLeft > 0 ? (totalDuration - timeLeft) : totalDuration;
    
    const resultData = {
      answers,
      totalQuestions: allQuestionsData.length,
      timeTaken: actualTimeTaken,
      submittedAt: new Date().toISOString(),
      isAutoSubmitted: false,
      cbtInfo: {
        license: license || "항해사",
        level: level,
        subjects: subjectNames,
      },
    };
    const wrongNotes: OneResult[] = allQuestionsData
      .map((q) => {
        const key = `${q.subjectName}-${q.num}`;
        const userChoice = answers[key];
        if (userChoice && userChoice !== q.answer) {
          return {
            choice: userChoice as "가" | "나" | "사" | "아",
            gichulqna_id: q.id,
            answer: q.answer,
          };
        }
        return null;
      })
              .filter((note): note is OneResult => note !== null);
    if (auth.token && auth.isLoggedIn) {
      try {
        await saveCbtResultToServer(resultData, auth.token);
      } catch (error) {
        console.error("서버 저장 실패:", error);
      }
      if (odapsetId && wrongNotes.length > 0) {
        try {
          console.log(`[CBT] 오답노트 ${wrongNotes.length}개를 서버에 저장합니다... (odapsetId: ${odapsetId}, 소요시간: ${actualTimeTaken}초)`);
          await saveManyUserAnswers(wrongNotes, odapsetId, auth.token, actualTimeTaken);
        } catch (e) {
          console.error("[오답노트 저장][cbt][실패]", e);
        }
      }
    } else {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("로그인 권장", {
            body: "로그인하면 CBT 결과를 마이페이지에서 확인할 수 있습니다.",
            icon: "/favicon.ico",
          });
        }
      }
    }
    onSubmit();
  }, [
    answers,
    allQuestionsData,
    license,
    level,
    subjectNames,
    auth.token,
    auth.isLoggedIn,
    odapsetId,
    saveCbtResultToServer,
    onSubmit,
    timeLeft,
    totalDuration,
  ]);

  return {
    isModalOpen,
    setIsModalOpen,
    answers,
    handleSelectAnswer,
    selectedSubject,
    setSelectedSubject,
    groupedData,
    allQuestionsData,
    setCurrentIdx,
    timeLeft,
    setTimeLeft,
    currentIdx,
    questionRefs,
    onSelectSubject,
    subjectNames,
    currentQuestions,
    selectedIndex,
    handleConfirmSubmit,
    totalDuration,
  };
} 