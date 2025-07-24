"use client";

import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { useEffect } from "react";
import React from "react";
import UserProfile from "@/components/mypage/UserProfile";
import PerformanceRadarChart from "@/components/mypage/PerformanceRadarChart";
import WrongNoteView from "@/components/mypage/WrongNoteView";
import ExamResultView from "@/components/mypage/ExamResultView";
import CbtResultView from "@/components/mypage/CbtResultView";
import AccumulatedComparisonChart from "@/components/mypage/ScoreTrendChart";
import AILearningDiagnosis from "@/components/mypage/AILearningDiagnosis";

export default function MyPage() {
  const router = useRouter();
  const auth = useAtomValue(authAtom);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.replace("/"); // 홈으로 이동
    }
  }, [auth.isLoggedIn, router]);

  if (!auth.isLoggedIn) return null; // 렌더링 차단

  return (
    <div className="bg-neutral-900 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 min-h-24">
          <div className="flex flex-col justify-center h-full text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              마이페이지
            </h1>
            <p className="text-neutral-400 mt-1 sm:mt-2 text-sm sm:text-base">
              나의 학습 현황을 한눈에 확인하세요.
            </p>
          </div>
          <div className="flex justify-center sm:block">
            <UserProfile />
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {/* 상단 2단 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-6">
            <div className="bg-neutral-800 rounded-xl p-4 md:p-6">
              <AccumulatedComparisonChart />
            </div>
            <div className="bg-neutral-800 rounded-xl p-4 md:p-6">
              <PerformanceRadarChart />
            </div>
          </div>

          {/* AI 학습진단 카드 */}
          <AILearningDiagnosis />

          {/* 하단 1단 그리드 */}
          <WrongNoteView />
          <ExamResultView />
          <CbtResultView />
        </div>
      </div>
    </div>
  );
}
