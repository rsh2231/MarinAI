"use client";

import { List, Send, Timer } from "lucide-react";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import {
  selectedSubjectAtom,
  examLoadingAtom,
  examErrorAtom,
  groupedQuestionsAtom,
  allQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  timeLeftAtom,
  isOmrVisibleAtom,
} from "@/atoms/examAtoms";

import SubjectTabs from "../solve/SubjectTabs";
import QuestionCard from "../solve/QuestionCard";
import { QuestionWithSubject, ProblemData } from "@/types/ProblemViwer";
import { getCode } from "@/utils/getCode";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyMessage } from "../ui/EmptyMessage";
import { OmrSheet } from "@/components/exam/OmrSheet";
import { ResultView } from "./ResultView";
import { SubmitModal } from "./SubmitModal";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
  durationSeconds?: number;
}

export default function ExamViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
  durationSeconds = 3600,
}: Props) {
  const [isLoading, setIsLoading] = useAtom(examLoadingAtom);
  const [error, setError] = useAtom(examErrorAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const [groupedQuestions, setGroupedQuestions] = useAtom(groupedQuestionsAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestionIndexAtom);
  const [, setIsOmrVisible] = useAtom(isOmrVisibleAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const isMobile = useWindowWidth(1024);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, levelStr);
  const filePath = `/data/${license}/${code}/${code}.json`;

  const normalizeSubject = (s: string) => s.replace(/^\d+\.\s*/, "");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("문제 파일을 불러올 수 없습니다.");
        const json: ProblemData = await res.json();

        const normalized = json.subject.type
          .filter((t) => selectedSubjects.includes(normalizeSubject(t.string)))
          .map((block) => ({
            subjectName: block.string,
            questions: block.questions.map((q) => ({ ...q, subjectName: block.string })),
          }));

        if (normalized.length > 0) {
          setSelectedSubject(normalized[0].subjectName); // 첫 과목 자동 설정
        }

        setGroupedQuestions(normalized);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(durationSeconds);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filePath, durationSeconds]);

  useEffect(() => {
    if (allQuestions.length === 0 || currentIdx >= allQuestions.length) return;
    const currentQuestion = allQuestions[currentIdx];
    setTimeout(() => {
      questionRefs.current[currentIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, [currentIdx, allQuestions]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, setTimeLeft]);

  const subjectNames = useMemo(() => groupedQuestions.map((g) => g.subjectName), [groupedQuestions]);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);
  const selectedBlock = groupedQuestions.find((g) => g.subjectName === selectedSubject);
  const isLastSubject = selectedIndex === subjectNames.length - 1;

  const totalCount = allQuestions.length;
  const correctCount = allQuestions.filter((q) => answers[`${q.subjectName}-${q.num}`] === q.answer).length;

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
  };

  const handleCancelSubmit = () => setIsSubmitModalOpen(false);

  if (isSubmitted) {
    return <ResultView total={totalCount} correct={correctCount} onRetry={() => {
      setIsSubmitted(false);
      setCurrentIdx(0);
      setTimeLeft(durationSeconds);
      setAnswers({});
    }} />;
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSubjectChange = (subjectName: string) => {
    setSelectedSubject(subjectName);
    const idx = allQuestions.findIndex((q) => q.subjectName === subjectName);
    if (idx !== -1) {
      setCurrentIdx(idx);
      scrollToTop();
    }
  };

  const handleSelectAnswer = (question: QuestionWithSubject, choice: string) => {
    const key = `${question.subjectName}-${question.num}`;
    setAnswers((prev) => ({ ...prev, [key]: choice }));

    const globalIndex = allQuestions.findIndex((q) => `${q.subjectName}-${q.num}` === key);
    if (globalIndex !== -1) {
      setCurrentIdx(globalIndex);
      setSelectedSubject(question.subjectName);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isLoading) return <p className="text-gray-400 text-center mt-6 text-sm">문제를 불러오는 중입니다...</p>;
  if (error) return <p className="text-red-500 text-center mt-6 text-sm">⚠️ {error}</p>;

  return (
    <div className="relative w-full max-w-3xl mx-auto px-2 sm:px-4 pb-10">
      <OmrSheet />
      {isMobile ? (
        <div className="fixed top-30 left-10 right-10 z-40 px-4 flex items-center justify-between">
          <div className="flex bg-blue-600 text-white font-mono text-sm px-3 py-1 rounded-full shadow-md animate-pulse">
            <Timer className="w-4 h-4 mr-1" /> <span>{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => setIsOmrVisible(true)}
            className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white text-sm rounded-full shadow-md hover:bg-gray-600"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center gap-4">
          <div className="flex bg-blue-600 text-white font-mono text-sm px-3 py-1 rounded-full shadow-md">
            <Timer className="w-4 h-4 mr-1" /> <span>{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => setIsOmrVisible(true)}
            className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white text-sm rounded-full hover:bg-gray-600"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      )}

      {subjectNames.length > 0 && selectedSubject && (
        <>
          <div className="w-full mb-4 flex justify-center px-2">
            <div className="w-full sm:w-3/4 md:w-1/2">
              <div className="flex items-center justify-center text-xs text-gray-300 mb-1">
                <div className="flex items-center gap-1 xs:gap-2">
                  <span className="text-blue-400 text-base xs:text-lg">📘</span>
                  <span className="truncate">
                    {selectedIndex + 1} / {subjectNames.length} 과목
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${((selectedIndex + 1) / subjectNames.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="flex justify-center overflow-x-auto px-2 sm:px-6 no-scrollbar">
            <SubjectTabs subjects={subjectNames} selected={selectedSubject} setSelected={handleSubjectChange} />
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {selectedBlock ? (
          <motion.section
            key={selectedBlock.subjectName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 sm:mt-8 space-y-5 sm:space-y-8 px-2"
          >
            {selectedBlock.questions.map((q) => {
              const globalIndex = allQuestions.findIndex(item => `${item.subjectName}-${item.num}` === `${q.subjectName}-${q.num}`);
              return (
                <div key={`${q.subjectName}-${q.num}`} ref={el => { if (globalIndex !== -1) questionRefs.current[globalIndex] = el }}>
                  <QuestionCard
                    question={q}
                    selected={answers[`${q.subjectName}-${q.num}`]}
                    showAnswer={false}
                    onSelect={(choice) => handleSelectAnswer(q, choice)}
                    license={license}
                    code={code}
                  />
                </div>
              );
            })}

            <div className="flex flex-row justify-center items-center gap-3 mt-8">
              <Button
                variant="neutral"
                onClick={() => { if (selectedIndex > 0) handleSubjectChange(subjectNames[selectedIndex - 1]) }}
                disabled={selectedIndex <= 0}
                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
              >
                <ChevronLeft className="mr-1" /> 이전 과목
              </Button>
              {isLastSubject ? (
                <Button
                  onClick={() => setIsSubmitModalOpen(true)}
                  variant="primary"
                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
                >
                  제출하기 <Send className="ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => { if (!isLastSubject) handleSubjectChange(subjectNames[selectedIndex + 1]) }}
                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
                >
                  다음 과목 <ChevronRight className="ml-1" />
                </Button>
              )}
            </div>
          </motion.section>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <EmptyMessage />
          </div>
        )}

        {isSubmitModalOpen && (
          <SubmitModal
            onConfirm={handleConfirmSubmit}
            onCancel={handleCancelSubmit}
            totalCount={totalCount}
            answeredCount={Object.keys(answers).length}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
