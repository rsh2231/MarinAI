"use client";

import React, { RefObject, useMemo, useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import {
  groupedQuestionsAtom,
  answersAtom,
  allQuestionsAtom,
  timeLeftAtom,
} from "@/atoms/examAtoms";
import { motion } from "framer-motion";

import { OverallSummary } from "./OverallSummary";
import { ExamSummaryCard } from "./ExamSummaryCard";
import { SubjectBreakdownCard } from "./SubjectBreakdownCard";
import { ProblemReviewHeader } from "./ProblemReviewHeader";
import { QuestionResultCard } from "./QuestionResultCard";
import { EmptyMessage } from "@/components/ui/EmptyMessage";

// 라이선스 타입 정의
// (props로 전달받음)
type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface ResultViewProps {
  onRetry: () => void;
  license: LicenseType;
  totalDuration: number;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export interface SubjectResult {
  subjectName: string;
  score: number;
  isPass: boolean;
  correctCount: number;
  totalCount: number;
}

const CHUNK_SIZE = 30; // 점진적 렌더링 시 한 번에 추가할 문제 개수

// 모바일 환경 감지 훅
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export const ResultView = ({
  onRetry,
  license,
  totalDuration,
  scrollRef,
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

  // 마운트 시 모든 주요 컨테이너에 대해 3회 반복 스크롤 최상단 이동
  useEffect(() => {
    const scrollToTop = () => {
      if (scrollRef && scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      if (document.body) document.body.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
      document.querySelectorAll('div,main,section').forEach(el => {
        el.scrollTop = 0;
      });
    };
    scrollToTop();
    setTimeout(scrollToTop, 100);
    setTimeout(scrollToTop, 300);
  }, []);

  // 점진적 렌더링: 모바일은 전체, 데스크탑은 CHUNK_SIZE씩
  const [renderCount, setRenderCount] = useState(isMobile ? filteredQuestions.length : CHUNK_SIZE);

  useEffect(() => {
    if (isMobile) {
      setRenderCount(filteredQuestions.length);
      return;
    }
    if (renderCount < filteredQuestions.length) {
      const id = setTimeout(
        () => setRenderCount((c) => Math.min(c + CHUNK_SIZE, filteredQuestions.length)),
        16
      );
      return () => clearTimeout(id);
    }
  }, [renderCount, filteredQuestions.length, selectedSubject, showOnlyWrong, isMobile]);

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

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 상단: 결과 요약/통계 */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            시험 결과 분석
          </h1>
          <p className="text-neutral-400 mt-2 border-b-2 border-neutral-700 pb-3">
            나의 취약점을 확인하고 다음 시험을 준비하세요.
          </p>
        </header>

        {/* 대시보드 그리드 (점수, 통계, 과목별 결과) */}
        <motion.div
          className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.2 : 0.5 }}
        >
          <div className="md:col-span-1 lg:col-span-1">
            <OverallSummary score={overallScore} isPass={isPass} />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <ExamSummaryCard {...summaryStats} />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <SubjectBreakdownCard subjectResults={subjectResults} />
          </div>
        </motion.div>

        {/* 문제 다시보기 영역 */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ProblemReviewHeader
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            showOnlyWrong={showOnlyWrong}
            setShowOnlyWrong={setShowOnlyWrong}
            onRetry={onRetry}
            subjectNames={subjectResults.map((r) => r.subjectName)}
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuestions.length > 0 ? (
              filteredQuestions
                .slice(0, renderCount)
                .map((question, index) => (
                <QuestionResultCard
                  key={`${question.subjectName}-${question.num}`}
                  question={question}
                  userAnswer={
                    answers[`${question.subjectName}-${question.num}`]
                  }
                  index={index}
                />
              ))
            ) : (
              <div className="flex md:col-span-2 justify-center items-center ">
                <EmptyMessage message="해당 조건에 맞는 문제가 없습니다." />
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* 하단 여백 (ScrollToTop 버튼 등) */}
      <div className="h-20"></div>
    </div>
  );
};
