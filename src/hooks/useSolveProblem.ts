import { useState } from "react";

export function useSolveProblem() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const solve = async (input: string) => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: input }),
      });

      if (!res.ok) throw new Error("문제풀이 요청 실패");
      const data = await res.json();
      setResult(data.explanation);
    } catch {
      setError("문제 풀이 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, solve };
}
