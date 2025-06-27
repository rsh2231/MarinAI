"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import ProblemViewer from "@/components/solve/ProblemViewer";
import HamburgerButton from "@/components/solve/HamburgerButton";

export default function SolvePage() {
  const [year, setYear] = useState("2023");
  const [license, setLicense] = useState("항해사");
  const [level, setLevel] = useState("1급");
  const [round, setRound] = useState("1회");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filterState = {
    year,
    setYear,
    license,
    setLicense,
    level,
    setLevel,
    round,
    setRound,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 relative min-h-screen
                 bg-[#1e293b] text-white overflow-x-hidden"
    >
      {/* 햄버거 버튼 */}
      {!sidebarOpen && (
        <HamburgerButton
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 text-blue-400 hover:text-blue-300"
        />
      )}

      {/* 사이드바 */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filterState={filterState}
        className="z-40 bg-[#1f2937] text-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-gray-700 rounded-xl"
      />

      <main
        className="flex-grow bg-[#1f2937] p-6 md:p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-gray-700
                   transition-all duration-300 min-w-0 overflow-auto"
      >
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl md:text-2xl font-bold select-none">
            기출문제 풀이
          </h1>
        </div>
        {/* 문제풀이 */}
        <ProblemViewer
          year={year}
          license={license}
          level={license === "소형선박조종사" ? "" : level}
          round={round}
        />
      </main>
    </motion.div>
  );
}
