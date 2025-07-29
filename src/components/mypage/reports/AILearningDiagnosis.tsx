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
  wrongNotes: unknown[];
  examResults: unknown[];
}) {
  const auth = useAtomValue(authAtom);
  const [showResult, setShowResult] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnosis = async () => {
    setLoading(true);
    setError(null);
    setAiMessage(""); // 스트리밍을 위해 빈 문자열로 초기화

    if (!auth?.token) {
      setError("로그인이 필요합니다. 다시 로그인해주세요.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ wrongNotes, examResults }),
      });

      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "AI 진단에 실패했습니다.");
        } catch {
          // JSON 파싱 실패 시 텍스트로 에러 처리
          const errorText = await res.text();
          throw new Error(errorText || "알 수 없는 서버 오류가 발생했습니다.");
        }
      }

      if (!res.body) {
        throw new Error("스트리밍 응답을 받지 못했습니다.");
      }

      // 스트림 읽기 시작
      setLoading(false);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setAiMessage((prev) => (prev || "") + chunk);
      }
    } catch (e: unknown) {
      setError((e as Error).message || "AI 진단 중 오류가 발생했습니다.");
      setLoading(false); // 에러 발생 시 로딩 상태 해제
    }
  };

  const handleToggle = () => {
    // 처음 열 때만 진단 실행
    if (!showResult && aiMessage === null) {
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
            {loading && (
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

            {aiMessage !== null && !loading && !error && (
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
