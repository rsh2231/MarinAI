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

export default function AILearningDiagnosis({ wrongNotes, examResults }: { wrongNotes: any, examResults: any }) {
  const auth = useAtomValue(authAtom);
  const indivname = auth?.user?.indivname || "수험생";
  const [showResult, setShowResult] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnosis = async () => {
    setLoading(true);
    setError(null);
    setAiMessage(null);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indivname, wrongNotes, examResults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AI 진단 실패");
      setAiMessage(data.message);
    } catch (e: any) {
      setError(e.message || "AI 진단 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!showResult && !aiMessage) {
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
            {aiMessage && !loading && !error && (
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
