"use client";

import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { useEffect } from "react";
import React from "react";
import UserProfile from "@/components/mypage/UserProfile";
import PerformanceRadarChart from "@/components/mypage/PerformanceRadarChart";
import ProgressSummary from "@/components/mypage/ProgressSummary";
import QuickLinks from "@/components/mypage/QuickLinks";
import WrongNoteView from "@/components/mypage/WrongNoteView";
import ExamResultView from "@/components/mypage/ExamResultView";
import CbtResultView from "@/components/mypage/CbtResultView";

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
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">마이페이지</h1>
          <p className="text-neutral-400 mt-2">
            나의 학습 현황을 한눈에 확인하세요.
          </p>
        </header>

        {/* 반응형 그리드 레이아웃 */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 주요 컨텐츠 영역 (왼쪽) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <WrongNoteView />
            <ExamResultView />
            <CbtResultView />
          </div>

          {/* 사이드바 영역 (오른쪽) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <UserProfile />
            <PerformanceRadarChart />
            <ProgressSummary />
            <QuickLinks />
          </div>
        </main>
      </div>
    </div>
  );
}
