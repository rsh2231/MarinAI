"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/solve/ProblemViewer";
import HamburgerButton from "@/components/solve/HamburgerButton";

export default function SolvePage() {
  const [year, setYear] = useState("2023");
  const [license, setLicense] = useState("항해사");
  const [level, setLevel] = useState("1급");
  const [round, setRound] = useState("1회");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-15 relative">
      {/* 햄버거 버튼 */}
      <HamburgerButton onClick={() => setSidebarOpen(true)} />

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
      <main className="flex-grow bg-white px-5 py-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">📘</span>
          <h1 className="text-xl md:text-2xl font-bold text-blue-700">
            기출문제 풀이
          </h1>
        </div>

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
