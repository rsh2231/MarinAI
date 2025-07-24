"use client";

import { useRef } from "react";
import MyPageHeader from "./MyPageHeader";
import MyPageCharts from "./MyPageCharts";
import MyPageReports from "./MyPageReports";
import AILearningDiagnosis from "@/components/mypage/reports/AILearningDiagnosis";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

export default function MyPageClient() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={scrollContainerRef}
      className="bg-neutral-900 h-screen overflow-auto"
    >
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyPageHeader />

        <div className="flex flex-col gap-6">
          <MyPageCharts />
          <AILearningDiagnosis />
          <MyPageReports />
        </div>
      </main>

      <ScrollToTopButton
        className="fixed bottom-6 right-6 lg:right-15 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
        scrollableRef={scrollContainerRef}
      />
    </div>
  );
}
