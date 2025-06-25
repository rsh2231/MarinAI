"use client";

import { useEffect, useState } from "react";
import { CBTProblem, mockProblems } from "@/data/mockProblems";

export default function CBTPage() {
  const [problems, setProblems] = useState<CBTProblem[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분
  const [timerEnded, setTimerEnded] = useState(false);
  const [started, setStarted] = useState(false); // ✅ 시험 시작 여부

  // ✅ 문제 초기화 (시작 시)
  useEffect(() => {
    if (!started) return;
    const shuffled = [...mockProblems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);
    setProblems(selected);
    setAnswers(Array(20).fill(null));
  }, [started]);

  // ✅ 시간 포맷
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ 타이머 작동
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

  // ✅ 시험 시작 전 UI
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">📝 CBT 모의시험</h1>
        <p className="mb-6 text-gray-700">
          총 20문제를 30분 안에 풀어보세요. <br />
          시험을 시작하면 타이머가 작동되며 되돌릴 수 없습니다.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded"
        >
          ▶️ 시험 시작
        </button>
      </div>
    );
  }

  // ✅ 시험 진행 중 UI
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 타이머 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📝 CBT 모의시험</h1>
        {!submitted && (
          <span
            className={`text-xl font-mono ${
              timeLeft <= 60 ? "text-red-600" : "text-gray-700"
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {/* 수동 제출 버튼 */}
      {!submitted && (
        <button
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          제출하기
        </button>
      )}

      {/* 문제 리스트 */}
      {problems.map((prob, index) => (
        <div key={prob.id} className="mb-6">
          <p className="font-semibold mb-2">
            {index + 1}. {prob.question}
          </p>
          <div className="flex flex-col gap-1">
            {prob.choices.map((choice, i) => {
              const selected = answers[index] === i;
              const isCorrect = prob.answerIndex === i;
              const isWrong = selected && !isCorrect;

              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => handleChoice(index, i)}
                  className={`text-left px-3 py-2 rounded border ${
                    selected ? "bg-blue-100" : "bg-white"
                  } ${
                    submitted && isCorrect
                      ? "bg-green-100 border-green-600"
                      : submitted && isWrong
                      ? "bg-red-100 border-red-600"
                      : "border-gray-300"
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {choice}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 점수 출력 */}
      {submitted && (
        <div className="mt-6 bg-yellow-100 p-4 rounded">
          ✅ 총점: <strong>{getScore()} / 20</strong>
        </div>
      )}
    </div>
  );
}
