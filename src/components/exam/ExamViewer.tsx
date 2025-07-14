"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { QnaItem, Question, Choice, SubjectGroup } from "@/types/ProblemViewer";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, List, Send, Timer } from "lucide-react";
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

// ProblemViewer에서 가져온 데이터 변환 함수
const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
  if (!qnas || qnas.length === 0) return [];

  const subjectMap = new Map<string, Question[]>();
  const imageCodeRegex = /(@pic[\w_-]+)/;

  const findImagePath = (code: string, paths: string[]): string | undefined => {
    const key = code.replace("@", "").trim().toLowerCase();
    return paths.find((p) => p.includes(key));
  };

  qnas.forEach((item) => {
    let questionStr = item.questionstr;
    let questionImagePath: string | undefined;

    const questionImageMatch = item.questionstr.match(imageCodeRegex);

    if (questionImageMatch && item.imgPaths) {
      const code = questionImageMatch[0];
      const foundPath = findImagePath(code, item.imgPaths);
      if (foundPath) {
        questionImagePath = foundPath;
        questionStr = questionStr.replace(code, "").trim();
      }
    }

    const choices: Choice[] = [
      { label: "가", text: item.ex1str },
      { label: "나", text: item.ex2str },
      { label: "다", text: item.ex3str }, // 원본 코드의 '사'를 '다'로 수정
      { label: "라", text: item.ex4str }, // 원본 코드의 '아'를 '라'로 수정
    ].map((choice) => {
      const choiceImageMatch = choice.text.match(imageCodeRegex);
      let choiceText = choice.text;
      let choiceImagePath: string | undefined;

      if (choiceImageMatch && item.imgPaths) {
        const code = choiceImageMatch[0];
        const foundPath = findImagePath(code, item.imgPaths);
        if (foundPath) {
          choiceImagePath = foundPath;
          choiceText = "";
        }
      }
      const isImg = !!choiceImagePath;
      return {
        ...choice,
        isImage: isImg,
        text: choiceText,
        imageUrl: choiceImagePath ? `/api/solve/img/${choiceImagePath}` : undefined,
      };
    });

    const question: Question = {
      id: item.id,
      num: item.qnum,
      questionStr,
      choices,
      answer: item.answer,
      explanation: item.explanation,
      subjectName: item.subject,
      isImageQuestion: !!item.imgPaths,
      imageUrl: questionImagePath ? `/api/solve/img/${questionImagePath}` : undefined,
    };

    if (!subjectMap.has(item.subject)) {
      subjectMap.set(item.subject, []);
    }
    subjectMap.get(item.subject)!.push(question);
  });

  return Array.from(subjectMap.entries()).map(([subjectName, questions]) => ({
    subjectName,
    questions,
  }));
};

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

  // ✅ [수정] 데이터 로딩 로직을 ProblemViewer와 동일하게 변경
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ year, license, level, round });
        const res = await fetch(`/api/solve?${params.toString()}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`
          );
        }

        const responseData: { qnas: QnaItem[] } = await res.json();
        const allSubjectGroups = transformData(responseData.qnas);

        if (allSubjectGroups.length === 0) {
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
          setGroupedQuestions([]);
          return;
        }
        
        // 사용자가 선택한 과목으로 필터링
        const filteredGroups = allSubjectGroups.filter((group) =>
          selectedSubjects.includes(group.subjectName)
        );

        if (filteredGroups.length === 0) {
          setError("선택하신 과목에 해당하는 문제가 없습니다. 과목을 다시 선택해주세요.");
        }

        // Jotai atom 상태 업데이트
        setGroupedQuestions(filteredGroups);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(durationSeconds);

        if (filteredGroups.length > 0) {
          setSelectedSubject(filteredGroups[0].subjectName);
        } else {
          setSelectedSubject(null);
        }

      } catch (err: any) {
        setError(err.message);
        setGroupedQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    // 의존성 배열에 props와 atom setter 함수들을 추가
  }, [year, license, level, round, selectedSubjects, durationSeconds, setIsLoading, setError, setGroupedQuestions, setAnswers, setCurrentIdx, setTimeLeft, setSelectedSubject]);

  useEffect(() => {
    if (allQuestions.length === 0 || currentIdx >= allQuestions.length) return;
    setTimeout(() => {
      questionRefs.current[currentIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, [currentIdx, allQuestions]);

  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return; // 제출 후 타이머 중지
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, setTimeLeft]);

  const subjectNames = useMemo(() => groupedQuestions.map((g) => g.subjectName), [groupedQuestions]);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);
  const selectedBlock = groupedQuestions.find((g) => g.subjectName === selectedSubject);
  const isLastSubject = selectedIndex === subjectNames.length - 1;

  const totalCount = allQuestions.length;
  const correctCount = allQuestions.filter((q) => answers[`${q.subjectName}-${q.num}`] === q.answer).length;

  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsSubmitted(true);
    scrollToTop();
  };

  const handleCancelSubmit = () => setIsSubmitModalOpen(false);
  
  const handleRetry = () => {
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(durationSeconds);
    setAnswers({});
    if (groupedQuestions.length > 0) {
        setSelectedSubject(groupedQuestions[0].subjectName);
    }
  }

  if (isSubmitted) {
    return <ResultView total={totalCount} correct={correctCount} onRetry={handleRetry} />;
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

  const handleSelectAnswer = (question: Question, choice: string) => {
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

  if (isLoading) return <p className="text-gray-400 text-center mt-6 text-sm">시험 문제를 불러오는 중입니다...</p>;
  if (error) return <p className="text-red-500 text-center mt-6 text-sm">⚠️ {error}</p>;
  if (groupedQuestions.length === 0 && !isLoading) {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <EmptyMessage message="선택하신 조건에 해당하는 문제가 없습니다." />
        </div>
      );
  }

  return (
    <div className="relative w-full max-w-3xl px-2 sm:px-4 pb-10">
      <OmrSheet />
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 flex items-center justify-between">
          <div className="flex items-center bg-blue-600 text-white font-mono text-sm px-3 py-1 rounded-full shadow-md animate-pulse">
            <Timer className="w-4 h-4 mr-1.5" /> <span>{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => setIsOmrVisible(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-700 text-white text-sm rounded-full shadow-md hover:bg-gray-600"
          >
            <List className="w-4 h-4" />
            <span>OMR</span>
          </button>
      </div>

      <div className="pt-16 sm:pt-12"> {/* 타이머/OMR 버튼에 가려지지 않도록 패딩 추가 */}
        {subjectNames.length > 0 && selectedSubject && (
            <>
            <div className="w-full mb-4 flex justify-center px-2">
                <div className="w-full sm:w-3/4 md:w-1/2">
                <div className="flex items-center justify-center text-gray-300 mb-1">
                    <div className="flex items-center gap-1 xs:gap-2">
                    <span className= "text-base xs:text-lg">📘</span>
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
                className="mt-6 sm:mt-8 space-y-5 sm:space-y-8"
            >
                {selectedBlock.questions.map((q) => {
                const globalIndex = allQuestions.findIndex(item => `${item.subjectName}-${item.num}` === `${q.subjectName}-${q.num}`);
                return (
                    <div key={`${q.subjectName}-${q.num}`} ref={el => { if (globalIndex !== -1) questionRefs.current[globalIndex] = el }}>
                    <QuestionCard
                        question={q}
                        selected={answers[`${q.subjectName}-${q.num}`]}
                        showAnswer={false} // 시험 모드에서는 정답을 보여주지 않음
                        onSelect={(choice) => handleSelectAnswer(q, choice)}
                        // license와 code prop 제거
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
                    <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
                </Button>
                {isLastSubject ? (
                    <Button
                    onClick={() => setIsSubmitModalOpen(true)}
                    variant="primary"
                    className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
                    >
                    제출하기 <Send className="ml-1 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                    onClick={() => { if (!isLastSubject) handleSubjectChange(subjectNames[selectedIndex + 1]) }}
                    className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
                    >
                    다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                )}
                </div>
            </motion.section>
            ) : (
                !isLoading && 
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
    </div>
  );
}