"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/solve/ProblemViewer";

export default function SolvePage() {
  const [year, setYear] = useState("2023");
  const [license, setLicense] = useState("항해사");
  const [level, setLevel] = useState("1급");
  const [round, setRound] = useState("1회");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 relative">
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-blue-600 text-white shadow-md"
        aria-label="사이드바 열기"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 사이드바 */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        year={year}
        setYear={setYear}
        license={license}
        setLicense={setLicense}
        level={level}
        setLevel={setLevel}
        round={round}
        setRound={setRound}
      />

      {/* 문제 보기 영역 */}
      <main className="flex-grow bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">📘 기출문제 풀이</h1>
        <ProblemViewer
          year={year}
          license={license}
          level={license === "소형선박조종사" ? "" : level}
          round={round}
        />
      </main>
    </div>
  );
}
