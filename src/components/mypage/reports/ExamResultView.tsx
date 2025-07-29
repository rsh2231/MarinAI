// 기출문제 풀이 결과
"use client";
import { useEffect, useState } from "react";
import { ClipboardList, ChevronRight, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import MiniBarChart from "@/components/mypage/charts/MiniBarChart";

const dummyResults = [
  {
    id: 1,
    title: "2024년 항해사 1급 2회 기출",
    score: "88점",
    date: "2025-07-16",
    subjectScores: [
      { subject: "항해", score: 85 },
      { subject: "기관", score: 90 },
      { subject: "법규", score: 78 },
      { subject: "영어", score: 70 },
    ],
  },
  {
    id: 2,
    title: "2024년 항해사 1급 1회 기출",
    score: "82점",
    date: "2025-07-11",
    subjectScores: [
      { subject: "항해", score: 80 },
      { subject: "기관", score: 85 },
      { subject: "법규", score: 72 },
      { subject: "영어", score: 68 },
    ],
  },
  {
    id: 3,
    title: "2023년 항해사 1급 2회 기출",
    score: "90점",
    date: "2024-07-16",
    subjectScores: [
      { subject: "항해", score: 88 },
      { subject: "기관", score: 92 },
      { subject: "법규", score: 80 },
      { subject: "영어", score: 75 },
    ],
  },
  {
    id: 4,
    title: "2023년 항해사 1급 1회 기출",
    score: "85점",
    date: "2024-07-11",
    subjectScores: [
      { subject: "항해", score: 82 },
      { subject: "기관", score: 87 },
      { subject: "법규", score: 76 },
      { subject: "영어", score: 70 },
    ],
  },
  {
    id: 5,
    title: "2022년 항해사 1급 2회 기출",
    score: "87점",
    date: "2023-07-16",
    subjectScores: [
      { subject: "항해", score: 84 },
      { subject: "기관", score: 89 },
      { subject: "법규", score: 74 },
      { subject: "영어", score: 68 },
    ],
  },
  {
    id: 6,
    title: "2022년 항해사 1급 1회 기출",
    score: "80점",
    date: "2023-07-11",
    subjectScores: [
      { subject: "항해", score: 78 },
      { subject: "기관", score: 83 },
      { subject: "법규", score: 70 },
      { subject: "영어", score: 65 },
    ],
  },
];

export default function ExamResultView({ setExamResults }: { setExamResults?: (results: unknown) => void }) {
  const [results, setResults] = useState(dummyResults);
  const [showAll, setShowAll] = useState(false);
  const [openIds, setOpenIds] = useState<number[]>([]);
  const visibleResults = showAll ? results : results.slice(0, 5);

  const toggleOpen = (id: number) => {
    setOpenIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
    );
  };

  useEffect(() => {
    const fetchResults = async () => {
      const token = sessionStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await fetch("/api/mypage/exam-results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          if (setExamResults) setExamResults(data);
        }
      } catch {
        // ignore, fallback to dummyResults
      }
    };
    fetchResults();
    if (setExamResults) setExamResults(results);
  }, []);

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList size={22} />
        기출문제 풀이 결과
      </h3>
      {visibleResults.length === 0 ? (
        <p className="text-neutral-400">저장된 결과가 없습니다.</p>
      ) : (
        <div className="relative">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.slice(0, 4).map((result) => {
              const open = openIds.includes(result.id);
              return (
                <li key={result.id} className="flex flex-col">
                  <button
                    className="flex justify-between items-center w-full p-2 sm:p-3 rounded-md font-semibold bg-neutral-700/50 focus:bg-blue-900/60 transition-colors outline-none ring-2 ring-transparent focus:ring-blue-400 text-xs sm:text-base"
                    aria-expanded={open}
                    aria-controls={`accordion-content-${result.id}`}
                    onClick={() => toggleOpen(result.id)}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-sm">{result.title}</p>
                      <p className="text-xs text-neutral-400">{result.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400 text-xs sm:text-base">{result.score}</span>
                      <ChevronRight
                        size={20}
                        className={`transition-transform duration-300 ${open ? 'rotate-90 text-blue-400' : 'text-neutral-500'}`}
                      />
                    </div>
                  </button>
                  <div
                    id={`accordion-content-${result.id}`}
                    className={`transition-all duration-500 bg-neutral-900/90 rounded-b-md shadow-inner will-change-[max-height,opacity,transform] ${open ? 'max-h-60 opacity-100 scale-100 py-2 sm:py-3 px-2 sm:px-4 mt-1' : 'max-h-0 opacity-0 scale-95 py-0 px-2 sm:px-4'}`}
                    aria-hidden={!open}
                  >
                    {open && (
                      <>
                        <MiniBarChart data={result.subjectScores} />
                        <div className="flex justify-end mt-2">
                          <Link
                            href={`/mypage/result/${result.id}`}
                            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 px-2 py-1 rounded"
                          >
                            상세보기 <ArrowUpRight size={16} />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
            <div
              className={`col-span-full transition-all duration-700 overflow-hidden ${showAll ? "max-h-96 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"}`}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.slice(4).map((result) => {
                  const open = openIds.includes(result.id);
                  return (
                    <li key={result.id} className="flex flex-col">
                      <button
                        className="flex justify-between items-center w-full p-2 sm:p-3 rounded-md font-semibold bg-neutral-700/50 focus:bg-blue-900/60 transition-colors outline-none ring-2 ring-transparent focus:ring-blue-400 text-xs sm:text-base"
                        aria-expanded={open}
                        aria-controls={`accordion-content-${result.id}`}
                        onClick={() => toggleOpen(result.id)}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-sm">{result.title}</p>
                          <p className="text-xs text-neutral-400">{result.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-400 text-xs sm:text-base">{result.score}</span>
                          <ChevronRight
                            size={20}
                            className={`transition-transform duration-300 ${open ? 'rotate-90 text-blue-400' : 'text-neutral-500'}`}
                          />
                        </div>
                      </button>
                      <div
                        id={`accordion-content-${result.id}`}
                        className={`transition-all duration-500 bg-neutral-900/90 rounded-b-md shadow-inner will-change-[max-height,opacity,transform] ${open ? 'max-h-60 opacity-100 scale-100 py-2 sm:py-3 px-2 sm:px-4 mt-1' : 'max-h-0 opacity-0 scale-95 py-0 px-2 sm:px-4'}`}
                        aria-hidden={!open}
                      >
                        {open && (
                          <>
                            <MiniBarChart data={result.subjectScores} />
                            <div className="flex justify-end mt-2">
                              <Link
                                href={`/mypage/result/${result.id}`}
                                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 px-2 py-1 rounded"
                              >
                                상세보기 <ArrowUpRight size={16} />
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </ul>
          {results.length > 5 && (
            <div className="flex justify-end mt-2">
              <button
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 px-3 py-2 rounded transition-all"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "닫기" : "전체 결과 보기"}
                {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
