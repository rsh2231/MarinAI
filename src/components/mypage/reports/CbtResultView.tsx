// CBT 풀이 결과
"use client";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import MiniBarChart from "@/components/mypage/charts/MiniBarChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// API 응답에 맞게 타입 재정의
interface SubjectScoreDetail {
  question_counts: number;
  correct_counts: number;
  passed: boolean;
}

interface CbtResult {
  resultset_id: number;
  exam_detail: string;
  total_score: number;
  subject_scores: Record<string, SubjectScoreDetail>;
}

export default function CbtResultView() {
  const [results, setResults] = useState<CbtResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [openIds, setOpenIds] = useState<number[]>([]);

  const toggleOpen = (id: number) => {
    setOpenIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
    );
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/mypage/cbt-results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setError("결과를 불러오는데 실패했습니다.");
        }
      } catch (e) {
        setError("데이터를 불러오는 중 에러가 발생했습니다.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const renderResultItem = (result: CbtResult) => {
    const open = openIds.includes(result.resultset_id);

    let chartData: { subject: string; score: number }[] = [];
    if (
      typeof result.subject_scores === "object" &&
      result.subject_scores !== null
    ) {
      chartData = Object.entries(result.subject_scores).map(
        ([subject, details]) => {
          const score =
            details.question_counts > 0
              ? (details.correct_counts / details.question_counts) * 100
              : 0;
          return { subject, score };
        }
      );
    }

    const totalScoreSum = chartData.reduce((sum, item) => sum + item.score, 0);
    const avgScore = chartData.length > 0 ? totalScoreSum / chartData.length : 0;

    return (
      <li key={result.resultset_id} className="flex flex-col">
        <button
          className="flex justify-between items-center w-full p-2 sm:p-3 rounded-md font-semibold bg-neutral-700/50 focus:bg-blue-900/60 transition-colors outline-none ring-2 ring-transparent focus:ring-blue-400 text-xs sm:text-base"
          aria-expanded={open}
          aria-controls={`accordion-content-${result.resultset_id}`}
          onClick={() => toggleOpen(result.resultset_id)}
        >
          <div className="min-w-0">
            <p className="font-semibold truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
              {result.exam_detail}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-400 text-xs sm:text-base">{`${avgScore.toFixed(
              0
            )}점`}</span>
            <ChevronRight
              size={20}
              className={`transition-transform duration-300 ${
                open ? "rotate-90 text-blue-400" : "text-neutral-500"
              }`}
            />
          </div>
        </button>
        <div
          id={`accordion-content-${result.resultset_id}`}
          className={`transition-all duration-500 bg-neutral-900/90 rounded-b-md shadow-inner will-change-[max-height,opacity,transform] ${
            open
              ? "max-h-60 opacity-100 scale-100 py-2 sm:py-3 px-2 sm:px-4 mt-1"
              : "max-h-0 opacity-0 scale-95 py-0 px-2 sm:px-4"
          }`}
          aria-hidden={!open}
        >
          {open && (
            <>
              {chartData.length > 0 ? (
                <MiniBarChart data={chartData} />
              ) : (
                <p className="text-neutral-400 text-center py-4">
                  차트 데이터가 없습니다.
                </p>
              )}
              <div className="flex justify-end mt-2">
                <Link
                  href={`/mypage/result/${result.resultset_id}`}
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
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList size={22} />
        CBT 풀이 결과
      </h3>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-neutral-400">저장된 CBT 결과가 없습니다.</p>
      ) : (
        <div className="relative">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.slice(0, 4).map(renderResultItem)}
            <div
              className={`col-span-full transition-all duration-700 overflow-hidden ${
                showAll
                  ? "max-h-[1000px] opacity-100 scale-100"
                  : "max-h-0 opacity-0 scale-95"
              }`}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.slice(4).map(renderResultItem)}
              </ul>
            </div>
          </ul>
          {results.length > 4 && (
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

