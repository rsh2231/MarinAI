"use client";

import React, { RefObject, useMemo, useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import {
  groupedQuestionsAtom,
  answersAtom,
  allQuestionsAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { useIsMobile } from "@/hooks/useIsMobile";

import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import ResultDashboard from "./ResultDashboard";
import ResultProblemList from "./ResultProblemList";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface ResultViewProps {
  onRetry: () => void;
  license: LicenseType;
  totalDuration: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  forceScreenHeight?: boolean;
  year?: string;
  round?: string;
  level?: string;
}

export interface SubjectResult {
  subjectName: string;
  score: number;
  isPass: boolean;
  correctCount: number;
  totalCount: number;
}

const CHUNK_SIZE = 30; // 점진적 렌더링 시 한 번에 추가할 문제 개수

export const ResultView = ({
  onRetry,
  license,
  totalDuration,
  scrollRef,
  forceScreenHeight = false,
  year,
  round,
  level,
}: ResultViewProps) => {
  // jotai atom에서 문제/답안/시간 등 상태 가져오기
  const groupedQuestions = useAtomValue(groupedQuestionsAtom);
  const allQuestions = useAtomValue(allQuestionsAtom);
  const answers = useAtomValue(answersAtom);
  const timeLeft = useAtomValue(timeLeftAtom);

  // 틀린 문제만 보기, 과목 탭 상태
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // 문제 리스트 필터링 (전체/과목별, 틀린 문제만 등)
  const filteredQuestions = useMemo(() => {
    if (selectedSubject === "all") {
      // 전체 탭: 과목별 순서대로 모든 문제 펼치기
      let questions = groupedQuestions.map((group) => group.questions).flat();
      if (showOnlyWrong) {
        questions = questions.filter(
          (q) => answers[`${q.subjectName}-${q.num}`] !== q.answer
        );
      }
      return questions;
    } else {
      // 과목 탭: 해당 과목만 필터링
      let questions = allQuestions;
      if (showOnlyWrong) {
        questions = questions.filter(
          (q) => answers[`${q.subjectName}-${q.num}`] !== q.answer
        );
      }
      questions = questions.filter((q) => q.subjectName === selectedSubject);
      return questions;
    }
  }, [allQuestions, answers, showOnlyWrong, selectedSubject, groupedQuestions]);

  const isMobile = useIsMobile();

  // 결과 화면 진입 시 스크롤 최상단 이동
  useEffect(() => {
    const HEADER_HEIGHT = 56;
    const scrollToHeader = () => {
      if (scrollRef?.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: HEADER_HEIGHT, behavior: 'instant' });
      }
    };

    scrollToHeader();
    const timeoutId = setTimeout(scrollToHeader, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // 점진적 렌더링: 모바일은 전체, 데스크탑은 CHUNK_SIZE씩
  const [renderCount, setRenderCount] = useState(
    isMobile ? filteredQuestions.length : CHUNK_SIZE
  );

  useEffect(() => {
    if (isMobile) {
      setRenderCount(filteredQuestions.length);
      return;
    }
    if (renderCount < filteredQuestions.length) {
      const id = setTimeout(
        () =>
          setRenderCount((c) =>
            Math.min(c + CHUNK_SIZE, filteredQuestions.length)
          ),
        16
      );
      return () => clearTimeout(id);
    }
  }, [
    renderCount,
    filteredQuestions.length,
    selectedSubject,
    showOnlyWrong,
    isMobile,
  ]);

  // 탭/옵션 변경 시 renderCount 초기화
  useEffect(() => {
    setRenderCount(isMobile ? filteredQuestions.length : CHUNK_SIZE);
  }, [selectedSubject, showOnlyWrong, filteredQuestions.length, isMobile]);

  // 시험 요약/통계 계산 (점수, 통과 여부, 과목별 결과 등)
  const { isPass, overallScore, subjectResults } = useMemo(() => {
    if (groupedQuestions.length === 0) {
      return { isPass: false, overallScore: 0, subjectResults: [] };
    }
    let totalScoreSum = 0;
    let allSubjectsPassed = true;
    const results: SubjectResult[] = groupedQuestions.map((group) => {
      const correctCount = group.questions.filter(
        (q) => answers[`${group.subjectName}-${q.num}`] === q.answer
      ).length;
      const totalCount = group.questions.length;
      const score =
        totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      totalScoreSum += score;
      const requiredScore =
        license === "항해사" && group.subjectName.includes("법규") ? 60 : 40;
      const isPass = score >= requiredScore;
      if (!isPass) {
        allSubjectsPassed = false;
      }
      return {
        subjectName: group.subjectName,
        score,
        isPass,
        correctCount,
        totalCount,
      };
    });
    const overallScore = Math.round(totalScoreSum / groupedQuestions.length);
    const averagePassed = overallScore >= 60;
    const finalIsPass = allSubjectsPassed && averagePassed;
    return { isPass: finalIsPass, overallScore, subjectResults: results };
  }, [groupedQuestions, answers, license]);

  // 시험 통계(정답/오답/미답/소요시간 등)
  const summaryStats = useMemo(() => {
    const timeTaken = totalDuration - timeLeft;
    const correctCount = allQuestions.filter(
      (q) => answers[`${q.subjectName}-${q.num}`] === q.answer
    ).length;
    const answeredCount = Object.keys(answers).length;
    const incorrectCount = answeredCount - correctCount;
    const unansweredCount = allQuestions.length - answeredCount;
    const weakestSubject =
      [...subjectResults].sort((a, b) => a.score - b.score)[0] || null;

    return {
      timeTaken,
      correctCount,
      incorrectCount,
      unansweredCount,
      weakestSubject,
    };
  }, [totalDuration, timeLeft, allQuestions, answers, subjectResults]);

  // 경로 표기 함수
  const renderPath = () => {
    if (year && round) {
      // Exam 모드
      return (
        <span>
          {year}년 {round}차 {license}
          {license !== "소형선박조종사" && level ? ` ${level}` : ""}
        </span>
      );
    }
    // CBT 모드
    return (
      <span>
        {license}
        {license !== "소형선박조종사" && level ? ` ${level}` : ""} 모의고사
      </span>
    );
  };

  return (
    <div className="h-full bg-neutral-900 text-white">
      <div
        ref={scrollRef}
        className={`${
          forceScreenHeight ? "h-screen" : "h-full"
        } overflow-y-auto`}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">
          {/* 상단: 결과 요약/통계 */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-lg font-semibold mb-2">
              {renderPath()}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              시험 결과 분석
            </h1>
            <p className="text-neutral-400 mt-2 border-b-2 border-neutral-700 pb-3">
              나의 취약점을 확인하고 다음 시험을 준비하세요.
            </p>
          </header>

          {/* 대시보드 영역 분리 */}
          <ResultDashboard
            overallScore={overallScore}
            isPass={isPass}
            summaryStats={summaryStats}
            subjectResults={subjectResults}
          />

          {/* 문제 리스트 영역 분리 */}
          <ResultProblemList
            filteredQuestions={filteredQuestions}
            renderCount={renderCount}
            selectedSubject={selectedSubject}
            subjectResults={subjectResults}
            showOnlyWrong={showOnlyWrong}
            setShowOnlyWrong={setShowOnlyWrong}
            setSelectedSubject={setSelectedSubject}
            onRetry={onRetry}
            answers={answers}
          />
        </div>
        <div className="h-20"></div>
        <ScrollToTopButton
          className="fixed bottom-6 right-6 lg:right-15 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
          scrollableRef={scrollRef}
        />
      </div>
    </div>
  );
};
