"use client";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import Link from 'next/link';

const dummyResults = [
  { id: 1, title: '2024년 2회차 5급 해기사 기출', score: '88점', date: '2025-07-16' },
  { id: 2, title: '2024년 1회차 5급 해기사 기출', score: '82점', date: '2025-07-11' },
];

export default function ExamResultView() {
  const [results, setResults] = useState(dummyResults);
  useEffect(() => {
    const fetchResults = async () => {
      const token = sessionStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await fetch("/api/mypage/exam-results", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        // ignore, fallback to dummyResults
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList size={22} />기출문제 풀이 결과
      </h3>
      <ul className="space-y-3">
        {results.map(result => (
          <li key={result.id}>
            <Link href={`/mypage/result/${result.id}`} className="flex justify-between items-center p-3 bg-neutral-700/50 rounded-md hover:bg-neutral-700 transition-colors">
              <div>
                <p className="font-semibold">{result.title}</p>
                <p className="text-xs text-neutral-400">{result.date}</p>
              </div>
              <span className="font-bold text-blue-400">{result.score}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="text-right mt-4">
        <Link href="/solve/results" className="text-sm text-blue-400 hover:text-blue-300">
          전체 결과 보기 →
        </Link>
      </div>
    </div>
  );
}