// 기출문제 풀이 결과
"use client";
import { useEffect, useState } from "react";
import { ClipboardList, ChevronRight, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import MiniBarChart from "@/components/mypage/charts/MiniBarChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ChartResult } from "@/components/mypage/charts/PerformanceRadarChart";

interface ApiSubjectScore {
  question_counts: number;
  correct_counts: number;
  passed: boolean;
}

interface ApiExamResult {
  resultset_id: number;
  exam_date: string;
  duration_sec: number;
  exam_detail: string;
  total_amount_of_questions: number;
  total_correct_counts: number;
  total_score: number;
  total_average: number;
  if_passed_test: boolean;
  subject_scores: Record<string, ApiSubjectScore>;
}

interface DisplaySubjectScore {
  subject: string;
  score: number;
}

interface DisplayExamResult {
  id: number;
  title: string;
  score: string;
  date: string; // Now includes time
  subjectScores: DisplaySubjectScore[];
}

export default function ExamResultView({ setExamResults }: { setExamResults?: (results: unknown) => void }) {
  const [results, setResults] = useState<DisplayExamResult[]>([]); // State now holds the transformed data
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(true);
      setError(null);
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/mypage/exam-results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: ApiExamResult[] = await res.json();
          
          const transformedData: DisplayExamResult[] = data.map(apiResult => {
            const subjectScores: DisplaySubjectScore[] = Object.entries(apiResult.subject_scores).map(([subject, scores]) => ({
              subject,
              score: scores.question_counts > 0 ? Math.round((scores.correct_counts / scores.question_counts) * 100) : 0,
            }));

            const displayTitle = apiResult.exam_detail.includes("소형선박조종사")
              ? apiResult.exam_detail.replace("0급", "").trim()
              : apiResult.exam_detail;

            return {
              id: apiResult.resultset_id,
              title: displayTitle,
              date: new Date(apiResult.exam_date).toLocaleString(),
              score: `${apiResult.total_average.toFixed(1)}점`,
              subjectScores,
            };
          });

          const chartResults: ChartResult[] = data.map(apiResult => ({
            date: apiResult.exam_date,
            subject_scores: apiResult.subject_scores,
          }));

          setResults(transformedData);
          if (setExamResults) setExamResults(chartResults);
        } else {
          const errorData = await res.json();
          setError(errorData.error || "결과를 불러오는데 실패했습니다.");
        }
      } catch(e) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [setExamResults]);

  if (isLoading) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg text-center min-h-[200px] flex justify-center items-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList size={22} />
        기출문제 풀이 결과
      </h3>
      {results.length === 0 ? (
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
              className={`col-span-full transition-all duration-700 overflow-hidden ${showAll ? "max-h-[500px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"}`}
            >
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
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