"use client";

import React, { useEffect, useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import {
  List,
  Timer,
  ChevronLeft,
  ChevronRight,
  SendHorizontal,
  Send,
} from "lucide-react";

import Button from "@/components/ui/Button";
import QuestionCard from "../solve/QuestionCard";
import { getCode } from "@/utils/getCode";
import { ResultView } from "./ResultView";
import { SubmitModal } from "./SubmitModal";
import { ExamLoader } from "./ExamLoader";
import { EmptyMessage } from "../ui/EmptyMessage";
import { OmrSheet } from "./OmrSheet";
import SubjectTabs from "../solve/SubjectTabs";

import {
  examLoadingAtom,
  examErrorAtom,
  groupedQuestionsAtom,
  allQuestionsAtom,
  currentQuestionIndexAtom,
  answersAtom,
  showResultAtom,
  timeLeftAtom,
  isOmrVisibleAtom,
} from "@/atoms/examAtoms";

import { ProblemData } from "@/types/ProblemViwer";

interface Props {
  year: string;
  license: string;
  level: string;
  round: string;
  selectedSubjects: string[];
  durationMinutes: number;
}

export default function ExamViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
  durationMinutes,
}: Props) {
  const [isLoading, setIsLoading] = useAtom(examLoadingAtom);
  const [error, setError] = useAtom(examErrorAtom);
  const [grouped, setGroupedQuestions] = useAtom(groupedQuestionsAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [showResult, setShowResult] = useAtom(showResultAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setIsOmrVisible] = useAtom(isOmrVisibleAtom);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;
    setIsOmrVisible(window.innerWidth >= 1024);
  }, [isMounted, setIsOmrVisible]);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, levelStr);
  const filePath = `/data/${license}/${code}/${code}.json`;

  const resetExam = useCallback(() => {
    setCurrentIdx(0);
    setAnswers({});
    setShowResult(false);
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes, setCurrentIdx, setAnswers, setShowResult, setTimeLeft]);

  const handleSelect = useCallback(
    (choice: string) => {
      const q = allQuestions[currentIdx];
      if (!q) return;
      const key = `${q.subjectName.replace(/^\d+\.\s*/, "")}-${q.num}`;
      setAnswers((prev) => ({ ...prev, [key]: choice }));
    },
    [allQuestions, currentIdx, setAnswers]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(filePath);
        if (!res.ok)
          throw new Error(`파일을 불러오지 못했습니다: ${res.status}`);
        const data: ProblemData = await res.json();

        const filtered = data.subject.type
          .filter((s) =>
            selectedSubjects.includes(s.string.replace(/^\d+\.\s*/, ""))
          )
          .map((s) => ({
            subjectName: s.string,
            questions: s.questions.map((q) => ({
              ...q,
              subjectName: s.string,
            })),
          }));

        setSubjectNames(filtered.map((g) => g.subjectName));
        setGroupedQuestions(filtered);
        resetExam();
      } catch (err: any) {
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

  useEffect(() => {
    if (showResult || allQuestions.length === 0 || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult, allQuestions.length, setTimeLeft, setShowResult]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const q = allQuestions[currentIdx];
  const key = `${q?.subjectName.replace(/^\d+\.\s*/, "")}-${q?.num}`;
  const answeredCount = Object.keys(answers).length;

  if (!isMounted) return null;
  if (isLoading) return <ExamLoader />;
  if (error)
    return <div className="text-red-400 flex justify-center">{error}</div>;
  if (!q)
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <EmptyMessage />
      </div>
    );

  if (showResult) {
    const correctCount = allQuestions.reduce((count, q) => {
      const key = `${q.subjectName.replace(/^\d+\.\s*/, "")}-${q.num}`;
      return answers[key] === q.answer ? count + 1 : count;
    }, 0);
    return (
      <ResultView
        total={allQuestions.length}
        correct={correctCount}
        onRetry={resetExam}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row border border-gray-700 rounded-lg bg-[#0f172a] h-full overflow-hidden">
      <div className="flex-1 flex flex-col">
        <header className="flex flex-col gap-2 p-3 border-b border-gray-700 bg-[#0f172a]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xl border-2 border-gray-100 p-2 rounded-xl text-blue-400 font-mono">
              <Timer className="w-6 h-6" />
              <span
                className={`text-2xl font-bold ${
                  timeLeft < 600 ? "text-red-500" : "text-white"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              onClick={() => setIsOmrVisible(true)}
              className="lg:hidden p-2 hover:bg-gray-700"
            >
              <List className="w-5 h-5 text-white" />
            </Button>
          </div>

          <div className="w-full mb-2 flex justify-center">
            <div className="w-full sm:w-3/4 md:w-1/2">
              <div className="flex items-center justify-center text-xs text-gray-300 mb-1">
                <span className="text-blue-400 text-base">📘</span>
                <span className="truncate">
                  {currentIdx + 1} / {allQuestions.length} 번 문제
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${((currentIdx + 1) / allQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto px-2 sm:px-6 no-scrollbar">
            <SubjectTabs
              subjects={subjectNames}
              selected={q.subjectName}
              setSelected={(name) => {
                const foundIdx = allQuestions.findIndex(
                  (q) => q.subjectName === name
                );
                if (foundIdx !== -1) {
                  setCurrentIdx(foundIdx);
                  window.scrollTo({ top: 0, behavior: "auto" });
                }
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#0f172a]">
          <div className="max-w-3xl mx-auto bg-[#0f1a2f] p-4 rounded-xl shadow-inner">
            <QuestionCard
              key={`${q.subjectName}-${q.num}`}
              question={q}
              selected={answers[key]}
              onSelect={handleSelect}
              license={license}
              code={code}
            />
          </div>
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-center gap-2 p-3 border-t border-gray-700 bg-[#1e293b] text-sm">
          <div className="flex justify-between w-auto gap-2">
            <Button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              variant="neutral"
            >
              <ChevronLeft className="w-4 h-4" /> 이전
            </Button>
            {currentIdx === allQuestions.length - 1 ? (
              <Button
                onClick={() => setShowSubmitModal(true)}
                variant="primary"
              >
                제출하기
                <Send className="ml-1 w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentIdx(
                    Math.min(allQuestions.length - 1, currentIdx + 1)
                  )
                }
                variant="neutral"
              >
                다음 <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </footer>
      </div>

      <OmrSheet />

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
