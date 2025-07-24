import React, { useState } from "react";
import {
  Flame,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  BrainCircuit,
} from "lucide-react";
import Button from "@/components/ui/Button";

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
      text: `${repeated
        .map((r) => r.subject)
        .join(", ")} 과목에서 반복 오답이 있습니다. 집중 복습을 추천해요!`,
    });
  }
  if (mostWrong && mostWrong.count >= 2) {
    messages.push({
      icon: <AlertTriangle className="text-red-500 w-5 h-5" />,
      color: "text-red-400",
      text: `${mostWrong.subject} 과목이 오답노트에 가장 많이 등록되었습니다.`,
    });
  }
  if (best && best.score >= 85) {
    messages.push({
      icon: <CheckCircle className="text-green-500 w-5 h-5" />,
      color: "text-green-400",
      text: `${best.subject} 과목의 정답률이 높아요! 강점을 살려보세요.`,
    });
  }
  if (worst && worst.score <= 70) {
    messages.push({
      icon: <TrendingUp className="text-blue-400 w-5 h-5" />,
      color: "text-blue-300",
      text: `${worst.subject} 과목의 점수가 낮아요. 추가 학습이 필요합니다.`,
    });
  }
  if (messages.length === 0) {
    messages.push({
      icon: <BookOpen className="text-primary w-5 h-5" />,
      color: "text-primary",
      text: "학습 데이터가 충분하지 않습니다. 꾸준히 기록을 남겨보세요!",
    });
  }
  return messages;
}

export default function AILearningDiagnosis() {
  const [showResult, setShowResult] = useState(false);
  const messages = showResult ? getDiagnosis() : [];
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-4 sm:p-6 mb-4">
      <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 sm:w-[22px] sm:h-[22px]" /> AI 학습진단
      </h2>
      {!showResult && (
        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={() => setShowResult(true)}>
            AI 학습진단 받기
          </Button>
        </div>
      )}
      {showResult && (
        <ul className="space-y-2 sm:space-y-3 mt-2">
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
        </ul>
      )}
    </div>
  );
}
