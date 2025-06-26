"use client";

import { useEffect, useState } from "react";
import { CBTProblem, mockProblems } from "../../../public/mockProblems";
import { motion } from "framer-motion";
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

  const getScore = () =>
    problems.reduce((score, prob, i) => {
      return answers[i] === prob.answerIndex ? score + 1 : score;
    }, 0);

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-screen-sm mx-auto mt-16 p-6 bg-[#1f2937] text-white shadow-md rounded-2xl text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-4">CBT 모의시험</h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
          총 <strong>20문제</strong>를 <strong>30분</strong> 안에 풀어보세요.
          <br />
          시험을 시작하면 타이머가 작동됩니다.
        </p>
        <Button onClick={() => setStarted(true)}>▶️ 시험 시작</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-screen-md mx-auto px-4 py-6 min-h-screen bg-[#1e293b] text-white"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-wide">CBT 모의시험</h1>
        {!submitted && (
          <span
            className={`px-4 py-2 rounded-xl font-mono text-sm sm:text-lg text-white
            ${timeLeft <= 60 ? "bg-red-600" : "bg-green-600"}`}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {!submitted && (
        <div className="mb-8 text-right">
          <Button onClick={handleSubmit}>
            제출하기
          </Button>
        </div>
      )}

      {problems.map((prob, index) => (
        <div
          key={prob.id}
          className="mb-8 p-5 rounded-xl bg-[#273449] border border-gray-700 shadow-md"
        >
          <p className="font-medium text-gray-200 mb-3">
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
                  variant="secondary"
                >
                  {String.fromCharCode(65 + i)}. {choice}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {submitted && (
        <div className="mt-10 p-6 bg-[#222c3a] border border-yellow-500 rounded-xl text-center">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">✅ 시험 완료</h2>
          <p className="text-lg text-gray-200">
            총점: <span className="font-bold text-white">{getScore()} / 20</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
