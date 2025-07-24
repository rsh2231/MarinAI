// AI 학습진단
import React, { useState } from "react";
import {
  Flame,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";

// 더미 오답노트 데이터 (WrongNoteView 참고)
const wrongNotes = [
  { subject: "기관1", count: 3 },
  { subject: "기관2", count: 1 },
  { subject: "직무일반", count: 2 },
  { subject: "영어", count: 1 },
];

// 더미 시험 결과 데이터 (ExamResultView 참고)
const examResults = [
  { subject: "기관1", score: 85 },
  { subject: "기관2", score: 90 },
  { subject: "기관3", score: 78 },
  { subject: "직무일반", score: 70 },
  { subject: "영어", score: 65 },
];

function getDiagnosis() {
  // 반복 오답
  const repeated = wrongNotes.filter((n) => n.count >= 2);
  // 오답 많은 과목
  const mostWrong = [...wrongNotes].sort((a, b) => b.count - a.count)[0];
  // 강점 과목
  const best = [...examResults].sort((a, b) => b.score - a.score)[0];
  // 약점 과목
  const worst = [...examResults].sort((a, b) => a.score - b.score)[0];

  const messages = [];
  if (repeated.length > 0) {
    messages.push({
      icon: <Flame className="text-orange-500 w-5 h-5" />,
      color: "text-orange-400",
      text: `최근 ${repeated.map(r => r.subject).join(", ")} 과목에서 반복 오답이 발생하고 있습니다. 해당 과목의 오답노트를 다시 복습하고, 틀린 문제의 해설을 꼼꼼히 읽어보세요. 비슷한 유형의 문제를 추가로 풀어보면 취약점을 빠르게 극복할 수 있습니다.`,
    });
  }
  if (mostWrong && mostWrong.count >= 2) {
    messages.push({
      icon: <AlertTriangle className="text-red-500 w-5 h-5" />,
      color: "text-red-400",
      text: `${mostWrong.subject} 과목이 오답노트에 가장 많이 등록되었습니다. 자주 틀리는 개념이나 문제 유형을 파악해 집중적으로 복습해보세요. 필요하다면 AI에게 해당 개념을 설명해달라고 요청해보는 것도 효과적입니다.`,
    });
  }
  if (best && best.score >= 85) {
    messages.push({
      icon: <CheckCircle className="text-green-500 w-5 h-5" />,
      color: "text-green-400",
      text: `${best.subject} 과목의 정답률이 ${best.score}%로 매우 우수합니다! 강점을 꾸준히 유지하기 위해 주기적으로 복습하고, 실전 모드에서 시간 내에 문제를 푸는 연습도 해보세요.`,
    });
  }
  if (worst && worst.score <= 70) {
    messages.push({
      icon: <TrendingUp className="text-blue-400 w-5 h-5" />,
      color: "text-blue-300",
      text: `${worst.subject} 과목의 점수가 낮은 편입니다. 최근 오답노트와 해설을 다시 확인하고, 해당 과목의 기출문제나 실전 모드로 추가 연습을 권장합니다. 어려운 문제는 AI에게 풀이 과정을 질문해보세요.`,
    });
  }
  if (messages.length === 0) {
    messages.push({
      icon: <BookOpen className="text-primary w-5 h-5" />,
      color: "text-primary",
      text: "아직 충분한 학습 데이터가 수집되지 않았습니다. 다양한 과목의 문제를 풀고, 오답노트에 틀린 문제를 기록해보세요. 꾸준한 학습 기록이 쌓일수록 AI가 더 정교한 진단과 맞춤 피드백을 제공할 수 있습니다.",
    });
  }
  return messages;
}

export default function AILearningDiagnosis() {
  const [showResult, setShowResult] = useState(false);
  const messages = showResult ? getDiagnosis() : [];
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 m-0">
          <BrainCircuit className="w-5 h-5 sm:w-[22px] sm:h-[22px]" /> AI 학습진단
        </h2>
        <button
          type="button"
          onClick={() => setShowResult((v) => !v)}
          className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 px-3 py-2 rounded transition-all"
        >
          {showResult ? "AI 학습진단 닫기" : "AI 학습진단 받기"}
          {showResult ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      <AnimatePresence>
        {showResult && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-2 sm:space-y-3 mt-2 break-keep overflow-hidden"
          >
            {messages.map((msg, i) => (
              <li
                key={i}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 ${msg.color}`}
              >
                {/* 아이콘 크기 반응형 */}
                {React.cloneElement(msg.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                <span className="text-sm sm:text-base font-medium">{msg.text}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
