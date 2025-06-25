"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveWrongNote } from "@/utils/localWrongNote";
import AnswerCard from "@/components/solve/AnswerCard";

export default function SolvePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const solveProblem = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: input }),
      });

      if (!res.ok) throw new Error("문제풀이 요청 실패");
      const data = await res.json();
      setResult(data.explanation);
    } catch (e) {
      setResult("문제 풀이 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">🔍 AI 문제풀이</h1>

      <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm space-y-4">
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`예시 입력:\n다음 중 충돌 회피와 가장 거리가 먼 것은?\n① 선회\n② 감속\n③ 항로 변경\n④ 기관 정지`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition disabled:opacity-50"
          onClick={solveProblem}
          disabled={loading}
        >
          {loading ? "풀이 중..." : "문제 풀이 요청"}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-3">
          <AnswerCard explanation={result} />

          <button
            onClick={() => {
              const note = {
                id: uuidv4(),
                question: input,
                explanation: result,
                createdAt: new Date().toISOString(),
              };
              saveWrongNote(note);
              alert("📌 오답노트에 저장되었습니다!");
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium transition"
          >
            📒 오답노트에 저장
          </button>
        </div>
      )}
    </div>
  );
}
