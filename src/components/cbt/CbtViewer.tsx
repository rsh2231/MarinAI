"use client";

import React, { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { List, Timer } from "lucide-react";

import { OmrSheet } from "./OmrSheet";
import Button from "@/components/ui/Button";
import QuestionCard from "../solve/QuestionCard";
import { getCode } from "@/utils/getCode";

import {
  cbtLoadingAtom,
  cbtErrorAtom,
  groupedQuestionsAtom,
  allQuestionsAtom,
  currentQuestionIndexAtom,
  answersAtom,
  showResultAtom,
  timeLeftAtom,
  isOmrVisibleAtom,
} from "@/atoms/cbtAtoms";

import { ProblemData } from "@/types/ProblemViwer";
import { ResultView } from "./ResultView";
import { SubmitModal } from "./SubmitModal";
import { CbtLoader } from "./CbtLoader";
import { CbtEmpty } from "./CbtEmpty";

interface Props {
  year: string;
  license: string;
  level: string;
  round: string;
  selectedSubjects: string[];
  durationMinutes: number;
}

export default function CbtViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
  durationMinutes,
}: Props) {
  // 상태
  const [isLoading, setIsLoading] = useAtom(cbtLoadingAtom);
  const [error, setError] = useAtom(cbtErrorAtom);
  const [groupedQuestions, setGroupedQuestions] = useAtom(groupedQuestionsAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [showResult, setShowResult] = useAtom(showResultAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [isOmrVisible, setIsOmrVisible] = useAtom(isOmrVisibleAtom);

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, levelStr);
  const filePath = `/data/${license}/${code}/${code}.json`;

  // 시험 초기화
  const resetExam = useCallback(() => {
    setCurrentIdx(0);
    setAnswers({});
    setShowResult(false);
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes, setCurrentIdx, setAnswers, setShowResult, setTimeLeft]);

  // 답안 선택
  const handleSelect = useCallback(
    (choice: string) => {
      const currentQuestion = allQuestions[currentIdx];
      if (!currentQuestion) return;
      const cleanSubjectName = currentQuestion.subjectName.replace(/^\d+\.\s*/, "");
      const key = `${cleanSubjectName}-${currentQuestion.num}`;
      setAnswers((prev) => ({ ...prev, [key]: choice }));
    },
    [allQuestions, currentIdx, setAnswers]
  );

  // 문제 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`파일을 불러오지 못했습니다: ${res.status}`);
        const data: ProblemData = await res.json();

        const filteredGroups = data.subject.type
          .filter((subj) =>
            selectedSubjects.includes(subj.string.replace(/^\d+\.\s*/, ""))
          )
          .map((subj) => ({
            subjectName: subj.string,
            questions: subj.questions.map((q) => ({
              ...q,
              subjectName: subj.string,
            })),
          }));

        setGroupedQuestions(filteredGroups);
        resetExam();
      } catch (err: any) {
        console.error("데이터 로딩 중 에러 발생:", err);
        setError(err.message || "알 수 없는 에러가 발생했습니다.");
        setGroupedQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    return () => {
      setGroupedQuestions([]);
      resetExam();
    };
  }, [
    filePath,
    selectedSubjects,
    setGroupedQuestions,
    setIsLoading,
    setError,
    resetExam,
  ]);

  // 타이머 useEffect
  useEffect(() => {
    if (showResult || allQuestions.length === 0 || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, showResult, allQuestions.length, setTimeLeft, setShowResult]);

  if (isLoading) return <CbtLoader />;
  if (error)
    return <div className="flex items-center justify-center h-full text-red-400">에러: {error}</div>;
  if (allQuestions.length === 0) return <CbtEmpty />;

  if (showResult) {
    const correctCount = allQuestions.reduce((count, q) => {
      const cleanSubjectName = q.subjectName.replace(/^\d+\.\s*/, "");
      const key = `${cleanSubjectName}-${q.num}`;
      return answers[key] === q.answer ? count + 1 : count;
    }, 0);
    return (
      <ResultView total={allQuestions.length} correct={correctCount} onRetry={resetExam} />
    );
  }

  const currentQuestion = allQuestions[currentIdx];
  const cleanSubjectName = currentQuestion.subjectName.replace(/^\d+\.\s*/, "");
  const selectedKey = `${cleanSubjectName}-${currentQuestion.num}`;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const prevQuestion = () => setCurrentIdx((idx) => Math.max(0, idx - 1));
  const nextQuestion = () =>
    setCurrentIdx((idx) => Math.min(allQuestions.length - 1, idx + 1));

  return (
    <div className="flex flex-col bg-[#0f172a] rounded-lg border border-gray-700 overflow-hidden h-full lg:flex-row">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-3 border-b border-gray-700 bg-[#1e293b] shrink-0">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <Timer className="w-5 h-5 text-blue-400" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-semibold sm:text-base">
              문제 {currentIdx + 1} / {allQuestions.length}
            </h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gray-600 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(answeredCount / allQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setIsOmrVisible(true)}
            className="p-2 rounded-md hover:bg-gray-700 lg:hidden"
          >
            <List className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-dots">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={`${currentQuestion.subjectName}-${currentQuestion.num}-${currentIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  selected={answers[selectedKey]}
                  onSelect={handleSelect}
                  license={license}
                  code={code}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-gray-700 bg-[#1e293b] shrink-0 text-sm">
          <div className="w-full sm:w-auto flex gap-2">
            <Button onClick={prevQuestion} disabled={currentIdx === 0} variant="neutral" className="w-full sm:w-auto">
              이전
            </Button>
            {currentIdx === allQuestions.length - 1 ? (
              <Button onClick={() => setShowSubmitModal(true)} variant="primary" className="w-full sm:w-auto">
                제출하기
              </Button>
            ) : (
              <Button onClick={nextQuestion} variant="neutral" className="w-full sm:w-auto">
                다음
              </Button>
            )}
          </div>
        </footer>
      </div>

      {/* 데스크탑 OMR 시트 */}
      <div className="hidden lg:block w-64 border-l border-gray-700">
        <OmrSheet />
      </div>

      {/* 모바일 OMR 시트 */}
      <AnimatePresence>{isOmrVisible && <OmrSheet />}</AnimatePresence>

      {/* 제출 모달 */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitModal
            onConfirm={() => {
              setShowSubmitModal(false);
              setShowResult(true);
            }}
            onCancel={() => setShowSubmitModal(false)}
            totalCount={allQuestions.length}
            answeredCount={answeredCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
