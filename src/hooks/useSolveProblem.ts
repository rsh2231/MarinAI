import { resolve } from "path";
import { useState } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSolveProblem() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const solve = async (input: string) => {
    
    setLoading(true);
    setResult(""); // 이전 결과를 초기화
    setError(""); // 이전 에러를 초기화

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: input }),
      });

      if (!res.ok) {
        // 스트리밍이 아닌 에러 응답(JSON)을 처리
        const errorData = await res
          .json()
          .catch(() => ({ error: "문제풀이 요청에 실패했습니다." }));
        throw new Error(errorData.error);
      }

      // response.body가 null이 아닌지 확인
      if (!res.body) {
        throw new Error("응답 스트림을 가져올 수 없습니다.");
      }

      // ReadableStream의 리더와 디코더를 생성
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // 스트림이 끝날 때까지 반복
      while (true) {
        const { done, value } = await reader.read();

        // 스트림이 종료되면 루프를 빠져나감
        if (done) {
          break;
        }

        // 받아온 데이터(Uint8Array)를 텍스트로 디코딩
        const chunk = decoder.decode(value);

        // 받아온 텍스트 덩어리(chunk)를 한 글자씩 순회하며 상태를 업데이트합니다.
        for (const char of chunk) {
          setResult((prevResult) => prevResult + char);
          await sleep(30); // 각 글자 사이에 20msdml 지연
        }
      }
    } catch (e: any) {
      // 에러 처리: e가 Error 객체인 경우 message를 사용, 아니면 문자열로 변환
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, solve };
}
