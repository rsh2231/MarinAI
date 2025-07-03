"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import QuestionCard from "./QuestionCard";
import { Question, ProblemData } from "@/types/ProblemViwer";
import { getCode } from "@/utils/getCode";

interface Props {
  year: string;
  license: string;
  level: string;
  round: string;
  selectedSubjects: string[];
  durationMinutes?: number;
  visible?: boolean;
}

export default function CbtViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
  durationMinutes = 125,
  visible = false,
}: Props) {
  // 훅은 무조건 최상단에서 호출
  const [data, setData] = useState<ProblemData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, levelStr);
  const filePath = `/data/${license}/${code}/${code}.json`;

  // 데이터 로딩 (visible 체크 포함)
  useEffect(() => {
    if (!visible) return;

    async function fetchData() {
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("문제 파일을 불러올 수 없습니다.");
        const json: ProblemData = await res.json();
        setData(json);
        setCurrentIdx(0);
        setAnswers({});
        setShowResult(false);
        setTimeLeft(durationMinutes * 60);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [filePath, durationMinutes, visible]);

  // 타이머 시작 / 종료 (visible 체크 포함)
  useEffect(() => {
    if (!visible || showResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setShowResult(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showResult, visible]);

  // visible이 false면 렌더링 안 함 (훅 호출 이후)
  if (!visible) return null;

  if (!data) {
    return (
      <p className="text-center text-gray-400 mt-10">
        문제를 불러오는 중입니다...
      </p>
    );
  }

  // 선택한 과목 문제만 필터링
  const filteredQuestions = data.subject.type
    .filter((subj) =>
      selectedSubjects.includes(subj.string.replace(/^\d+\.\s*/, ""))
    )
    .flatMap((subj) => subj.questions);

  const questions = filteredQuestions as Question[];

  if (questions.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-10">
        선택한 과목에 해당하는 문제가 없습니다.
      </p>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleSelect = useCallback(
    (choice: string) => {
      setAnswers((prev) => {
        const currentNum = questions[currentIdx].num;
        return { ...prev, [currentNum]: choice };
      });
    },
    [currentIdx, questions]
  );

  const prevQuestion = () => {
    setCurrentIdx((idx) => Math.max(0, idx - 1));
  };

  const nextQuestion = () => {
    setCurrentIdx((idx) => Math.min(questions.length - 1, idx + 1));
  };

  const handleSubmit = () => {
    setShowResult(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const correctCount = questions.reduce((count, q) => {
    if (answers[q.num] === q.answer) return count + 1;
    return count;
  }, 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (showResult) {
    return (
      <div className="max-w-xl mx-auto p-4 text-center text-white bg-[#1f2937] rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">시험 종료</h2>
        <p className="mb-2">
          전체 문제 수: <strong>{questions.length}</strong>
        </p>
        <p className="mb-4">
          맞힌 문제 수: <strong>{correctCount}</strong>
        </p>
        <Button onClick={() => setShowResult(false)} className="mr-2">
          다시 풀기
        </Button>
        <Button onClick={() => window.location.reload()} variant="secondary">
          페이지 새로고침
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-[#1f2937] rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-4 font-mono text-lg">
        <div>
          남은 시간:{" "}
          <span className="text-blue-400">{formatTime(timeLeft)}</span>
        </div>
        <div>
          문제 {currentIdx + 1} / {questions.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.num}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionCard
            question={currentQuestion}
            selected={answers[currentQuestion.num]}
            onSelect={handleSelect}
            license={license}
            code={code}
            onToggle={() => {}}
            showAnswer={false}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          onClick={prevQuestion}
          disabled={currentIdx === 0}
          variant="neutral"
        >
          이전
        </Button>
        {currentIdx === questions.length - 1 ? (
          <Button onClick={handleSubmit} variant="primary">
            제출하기
          </Button>
        ) : (
          <Button onClick={nextQuestion} variant="neutral">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}