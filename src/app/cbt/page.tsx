"use client";

import { useEffect, useState } from "react";
import { CBTProblem, mockProblems } from "../../../public/data/mockProblems";
import Button from "@/components/ui/Button";

export default function CBTPage() {
  const [problems, setProblems] = useState<CBTProblem[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [timerEnded, setTimerEnded] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const shuffled = [...mockProblems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);
    setProblems(selected);
    setAnswers(Array(20).fill(null));
  }, [started]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!started || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerEnded(true);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted]);

  useEffect(() => {
    if (timerEnded) {
      alert("⏰ 시간이 종료되어 자동 제출되었습니다!");
    }
  }, [timerEnded]);

  const handleChoice = (index: number, choiceIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = choiceIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getScore = () => {
    return problems.reduce((score, prob, i) => {
      if (answers[i] === prob.answerIndex) return score + 1;
      return score;
    }, 0);
  };

  // ✅ 시험 시작 전 화면
  if (!started) {
    return (
      <div className="max-w-screen-sm mx-auto mt-16 p-6 bg-white shadow-md rounded-2xl text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">📝 CBT 모의시험</h1>
        <p className="text-gray-600 mb-6">
          총 <strong>20문제</strong>를 <strong>30분</strong> 안에 풀어보세요.<br />
          시험을 시작하면 타이머가 작동됩니다.
        </p>
        <Button
          onClick={() => setStarted(true)}
        >
          ▶️ 시험 시작
        </Button>
      </div>
    );
  }

  // ✅ 시험 진행 화면
  return (
    <div className="max-w-screen-md mx-auto p-4">
      {/* 상단 바 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">📋 CBT 모의시험</h1>
        {!submitted && (
          <span
            className={`px-4 py-2 rounded-xl font-mono text-white text-lg ${
              timeLeft <= 60 ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {/* 제출 버튼 */}
      {!submitted && (
        <div className="mb-6 text-right">
          <Button
            onClick={handleSubmit}
            color="green"
          >
            제출하기
          </Button>
        </div>
      )}

      {/* 문제 목록 */}
      {problems.map((prob, index) => (
        <div key={prob.id} className="mb-6 p-4 bg-white rounded-xl shadow-sm border">
          <p className="font-semibold text-gray-800 mb-2">
            {index + 1}. {prob.question}
          </p>
          <div className="flex flex-col gap-2">
            {prob.choices.map((choice, i) => {
              const selected = answers[index] === i;
              const isCorrect = prob.answerIndex === i;
              const isWrong = selected && !isCorrect;

              return (
                <Button
                  key={i}
                  disabled={submitted}
                  onClick={() => handleChoice(index, i)}
                  className={`text-left px-4 py-2 rounded-lg border transition-all ${
                    selected ? "ring-2 ring-blue-300" : ""
                  } ${
                    submitted && isCorrect
                      ? "bg-green-100 border-green-500"
                      : submitted && isWrong
                      ? "bg-red-100 border-red-500"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {choice}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 점수 결과 */}
      {submitted && (
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-300 rounded-xl text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">✅ 시험 완료</h2>
          <p className="text-lg">
            총점: <strong>{getScore()} / 20</strong>
          </p>
        </div>
      )}
    </div>
  );
}
