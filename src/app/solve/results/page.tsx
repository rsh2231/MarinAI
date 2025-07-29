import Link from "next/link";

const dummyResults = [
  { id: 1, title: '2024년 2회차 1급 항해사 기출', score: '88점', date: '2025-07-16' },
  { id: 2, title: '2024년 1회차 1급 항해사 기출', score: '82점', date: '2025-07-11' },
];

export default function ExamResultsPage() {
  // 실제로는 useEffect로 fetch
  const results = dummyResults;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">기출문제 전체 풀이 결과</h2>
      <ul className="space-y-3">
        {results.map(result => (
          <li key={result.id}>
            <Link href={`/mypage/result/${result.id}`} className="block p-4 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{result.title}</p>
                  <p className="text-xs text-neutral-400">{result.date}</p>
                </div>
                <span className="font-bold text-blue-400">{result.score}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 