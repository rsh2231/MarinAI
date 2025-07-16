"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
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

import { QnaItem, Question } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";

import ViewerCore from "../UI/ViewerCore";
import QuestionCard from "../UI/QuestionCard";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, List, Send, Timer } from "lucide-react";
import { OmrSheet } from "@/components/problem/exam/OmrSheet";
import { ResultView } from "../UI/ResultView";
import { SubmitModal } from "./SubmitModal";
import { EmptyMessage } from "../../ui/EmptyMessage";
import SubjectTabs from "../UI/SubjectTabs";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
}

const DURATION_PER_SUBJECT_SECONDS = 25 * 60;

export default function ExamViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
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

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalDuration = useMemo(
    () => selectedSubjects.length * DURATION_PER_SUBJECT_SECONDS,
    [selectedSubjects.length]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setIsSubmitted(false);
      try {
        const params = new URLSearchParams({ year, license, level, round });
        const res = await fetch(`/api/solve?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`);
        }
        const responseData: { qnas: QnaItem[] } = await res.json();
        const allSubjectGroups = transformData(responseData.qnas);
        if (allSubjectGroups.length === 0) {
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
          setGroupedQuestions([]); return;
        }
        const filteredGroups = allSubjectGroups.filter((group) => selectedSubjects.includes(group.subjectName));
        if (filteredGroups.length === 0) {
          setError("선택하신 과목에 해당하는 문제가 없습니다. 과목을 다시 선택해주세요.");
        }
        setGroupedQuestions(filteredGroups);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(totalDuration);
        setSelectedSubject(filteredGroups.length > 0 ? filteredGroups[0].subjectName : null);
      } catch (err: any) {
        setError(err.message);
        setGroupedQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedSubjects.length > 0) {
      fetchData();
    }
  }, [year, license, level, round, selectedSubjects, totalDuration, setIsLoading, setError, setGroupedQuestions, setAnswers, setCurrentIdx, setTimeLeft, setSelectedSubject]);

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    const timerId = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, setTimeLeft]);

  const navigateToQuestion = (targetIndex: number, options: { shouldScrollToTop?: boolean } = {}) => {
    if (targetIndex < 0 || targetIndex >= allQuestions.length) return;
    const question = allQuestions[targetIndex];
    if (!question) return;
    setCurrentIdx(targetIndex);
    setSelectedSubject(question.subjectName);
    if (options.shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  useEffect(() => {
    if (allQuestions.length === 0 || currentIdx >= allQuestions.length) return;
    setTimeout(() => { questionRefs.current[currentIdx]?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
  }, [currentIdx, allQuestions.length]);

  const handleSubjectChange = (subjectName: string) => {
    const firstQuestionIndex = allQuestions.findIndex((q) => q.subjectName === subjectName);
    if (firstQuestionIndex !== -1) {
      navigateToQuestion(firstQuestionIndex, { shouldScrollToTop: true });
    }
  };

  const handleSelectAnswer = (question: Question, choice: string) => {
    const key = `${question.subjectName}-${question.num}`;
    setAnswers((prev) => ({ ...prev, [key]: choice }));
  };

  const handleQuestionSelectFromOMR = (question: Question, index: number) => { navigateToQuestion(index); };

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(totalDuration);
    setAnswers({});
    if (groupedQuestions.length > 0) {
      setSelectedSubject(groupedQuestions[0].subjectName);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isSubmitted) {
    const totalCount = allQuestions.length;
    const correctCount = allQuestions.filter(
      (q) => answers[`${q.subjectName}-${q.num}`] === q.answer
    ).length;
    return <ResultView total={totalCount} correct={correctCount} onRetry={handleRetry} />;
  }

  if (selectedSubjects.length === 0 && !isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[300px]"><EmptyMessage message="선택한 과목에 해당하는 문제가 없습니다. 사이드바에서 과목을 선택해주세요." /></div>;
  }

  const subjectNames = groupedQuestions.map((g) => g.subjectName);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);
  const isLastSubject = selectedIndex === subjectNames.length - 1;

  return (
    <>
      <OmrSheet onSelectQuestion={handleQuestionSelectFromOMR} />
      {isSubmitModalOpen && <SubmitModal onConfirm={handleConfirmSubmit} onCancel={() => setIsSubmitModalOpen(false)} totalCount={allQuestions.length} answeredCount={Object.keys(answers).length} />}

      <ViewerCore
        isLoading={isLoading}
        error={error}
        filteredSubjects={groupedQuestions}
        selectedSubject={selectedSubject}
        headerContent={
          <header className="sticky top-16 sm:top-20 z-30 bg-neutral-900/80 backdrop-blur-sm shadow-md">
            <div className="w-full max-w-3xl mx-auto px-3 pt-3 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-200 order-1">
                  <span className="text-lg hidden sm:inline">📘</span>
                  <p className="font-bold text-base">
                    {selectedSubject}
                    <span className="text-gray-400 font-normal ml-1.5">({selectedIndex + 1}/{subjectNames.length})</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 order-2">
                  <div className={`flex items-center gap-2 font-mono text-base sm:text-lg font-bold rounded-md ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-blue-300"}`}>
                    <Timer className="w-5 h-5" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  <Button variant="neutral" size="sm" onClick={() => setIsOmrVisible(true)} className="bg-neutral-800/50 border-neutral-700 hover:bg-neutral-700">
                    <List className="w-4 h-4 mr-2" />
                    답안지
                  </Button>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>과목 진행도</span>
                </div>
                <div className="w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${((selectedIndex + 1) / subjectNames.length) * 100}%` }} />
                </div>
              </div>
            </div>
            {subjectNames.length > 0 && selectedSubject && (
              <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
                <SubjectTabs
                  subjects={subjectNames}
                  selected={selectedSubject}
                  setSelected={handleSubjectChange}
                  variant="header"
                />
              </div>
            )}
          </header>
        }
        footerContent={
          <>
            <Button variant="neutral" onClick={() => handleSubjectChange(subjectNames[selectedIndex - 1])} disabled={selectedIndex <= 0} className="w-full sm:w-auto">
              <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
            </Button>
            {isLastSubject ? (
              <Button onClick={() => setIsSubmitModalOpen(true)} variant="primary" className="w-full sm:w-auto">
                제출하기 <Send className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => handleSubjectChange(subjectNames[selectedIndex + 1])} className="w-full sm:w-auto">
                다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </>
        }
      >
        <div className="mt-6 sm:mt-8">
            {groupedQuestions.find(g => g.subjectName === selectedSubject)?.questions.map((q) => {
            const globalIndex = allQuestions.findIndex(item => `${item.subjectName}-${item.num}` === `${q.subjectName}-${q.num}`);
            return (
                <div key={`${q.subjectName}-${q.num}`} ref={(el) => { if (globalIndex !== -1) questionRefs.current[globalIndex] = el; }}>
                <QuestionCard question={q} selected={answers[`${q.subjectName}-${q.num}`]} showAnswer={false} onSelect={(choice) => handleSelectAnswer(q, choice)} />
                </div>
            );
            })}
        </div>
      </ViewerCore>
    </>
  );
}