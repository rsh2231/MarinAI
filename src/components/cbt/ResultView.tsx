import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";

interface ResultViewProps {
  total: number;
  correct: number;
  onRetry: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ total, correct, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full bg-[#0f172a] text-white p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1e293b] p-8 rounded-xl shadow-lg text-center max-w-sm w-full border border-gray-700"
    >
      <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
      <h2 className="text-2xl font-bold mb-2">시험 종료</h2>
      <p className="text-gray-400 mb-6">수고하셨습니다!</p>
      <div className="text-left space-y-3">
        <p className="flex justify-between"><span>총 문제</span> <strong>{total}개</strong></p>
        <p className="flex justify-between"><span>맞힌 문제</span> <strong className="text-green-400">{correct}개</strong></p>
        <p className="flex justify-between"><span>틀린 문제</span> <strong className="text-red-400">{total - correct}개</strong></p>
      </div>
      <div className="mt-8 flex gap-4">
        <Button onClick={onRetry} className="flex-1">다시 풀기</Button>
        <Button onClick={() => window.location.reload()} variant="secondary" className="flex-1">나가기</Button>
      </div>
    </motion.div>
  </div>
);