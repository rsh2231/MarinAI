"use client";

import React, { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { List, Timer, ChevronLeft, ChevronRight, Send } from "lucide-react";

import Button from "@/components/ui/Button";
import QuestionCard from "../solve/QuestionCard";
import { getCode } from "@/utils/getCode";
import { ResultView } from "./ResultView";
import { SubmitModal } from "./SubmitModal";
import { CbtLoader } from "./CbtLoader";
import { EmptyMessage } from "../ui/EmptyMessage";
import { OmrSheet } from "./OmrSheet";

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
  const [isLoading, setIsLoading] = useAtom(cbtLoadingAtom);
  const [error, setError] = useAtom(cbtErrorAtom);
  const [, setGroupedQuestions] = useAtom(groupedQuestionsAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [showResult, setShowResult] = useAtom(showResultAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setIsOmrVisible] = useAtom(isOmrVisibleAtom);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // SSR-safe

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (window.innerWidth >= 1024) {
      setIsOmrVisible(true);
    } else {
      setIsOmrVisible(false);
    }
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
        if (!res.ok) throw new Error(`파일을 불러오지 못했습니다: ${res.status}`);
        const data: ProblemData = await res.json();

        const filtered = data.subject.type
          .filter((s) => selectedSubjects.includes(s.string.replace(/^\d+\.\s*/, "")))
          .map((s) => ({
            subjectName: s.string,
            questions: s.questions.map((q) => ({ ...q, subjectName: s.string })),
          }));

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
  }, [filePath, selectedSubjects, setGroupedQuestions, setIsLoading, setError, resetExam]);

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
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isMounted) return null; // SSR-safe: hydration 불일치 방지

  if (isLoading) return <CbtLoader />;
  if (error) return <div className="text-red-400 flex justify-center">{error}</div>;
  if (allQuestions.length === 0) return <EmptyMessage />;

  if (showResult) {
    const correctCount = allQuestions.reduce((count, q) => {
      const key = `${q.subjectName.replace(/^\d+\.\s*/, "")}-${q.num}`;
      return answers[key] === q.answer ? count + 1 : count;
    }, 0);
    return <ResultView total={allQuestions.length} correct={correctCount} onRetry={resetExam} />;
  }

  const q = allQuestions[currentIdx];
  const key = `${q.subjectName.replace(/^\d+\.\s*/, "")}-${q.num}`;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col lg:flex-row border border-gray-700 rounded-lg bg-[#0f172a] h-full overflow-hidden">
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-3 border-b border-gray-700 bg-[#1e293b]">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <Timer className="w-5 h-5 text-blue-400" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-semibold">
              문제 {currentIdx + 1} / {allQuestions.length}
            </h2>
            <div className="w-24 sm:w-32 h-1.5 bg-gray-600 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(answeredCount / allQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          <Button onClick={() => setIsOmrVisible(true)} className="lg:hidden p-2 hover:bg-gray-700">
            <List className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${key}-${currentIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionCard
                question={q}
                selected={answers[key]}
                onSelect={handleSelect}
                license={license}
                code={code}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-gray-700 bg-[#1e293b] text-sm">
          <div className="w-full sm:w-auto flex gap-2">
            <Button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} variant="neutral">
              <ChevronLeft className="w-4 h-4" /> 이전
            </Button>
            {currentIdx === allQuestions.length - 1 ? (
              <Button onClick={() => setShowSubmitModal(true)} variant="primary">
                제출하기 <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => setCurrentIdx(Math.min(allQuestions.length - 1, currentIdx + 1))} variant="neutral">
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
