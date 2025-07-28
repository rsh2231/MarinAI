// AI 학습진단
import React, { useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AIResponseRenderer from "./AIResponseRenderer";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";

export default function AILearningDiagnosis({
  wrongNotes,
  examResults,
}: {
  wrongNotes: any;
  examResults: any;
}) {
  const auth = useAtomValue(authAtom);
  const [showResult, setShowResult] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnosis = async () => {
    if (aiMessage) return;

    if (!auth?.token) {
      setError("AI 진단을 위해서는 로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    setError(null);
    setAiMessage("");

    try {
      // 1. Next.js API Route로 POST 요청
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          // 2. 인증 토큰과 Content-Type을 헤더에 추가
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        // 3. Body는 간단한 JSON 객체로 전송
        body: JSON.stringify({ wrongNotes, examResults }),
      });

      // 스트리밍 응답이 아닌, 일반 JSON 오류 응답 처리
      if (
        !res.ok &&
        res.headers.get("Content-Type")?.includes("application/json")
      ) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `AI 진단 서버 오류: ${res.status}`
        );
      }

      if (!res.ok) {
        throw new Error(`AI 진단 서버 오류: ${res.status} ${res.statusText}`);
      }

      // 4. StreamingResponse(SSE) 처리
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("응답 스트림을 읽을 수 없습니다.");
      }
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            setAiMessage((prev) => prev + data);
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "AI 진단 중 알 수 없는 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!showResult && !loading && !aiMessage) {
      handleDiagnosis();
    }
    setShowResult((v) => !v);
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-4 sm:p-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 m-0">
          <BrainCircuit className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          AI 학습진단
        </h2>
        <div className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
          {showResult ? "닫기" : "결과 보기"}
          {showResult ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: "1rem" }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="break-keep overflow-hidden"
          >
            {loading && !aiMessage && (
              <LoadingSpinner
                text="AI가 맞춤 진단을 생성하고 있어요..."
                minHeight="100px"
              />
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}
            {aiMessage && !error && (
              <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                <AIResponseRenderer message={aiMessage} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
