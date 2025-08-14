"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  BadgeCheck,
  XCircle,
  BookOpen,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { QuestionResultCard } from "@/components/problem/result/QuestionResultCard";
import { Question, Choice, QnaItem } from "@/types/ProblemViewer";
import { ProblemReviewHeader } from "@/components/problem/result/ProblemReviewHeader";
import { transformData } from "@/lib/problem-utils";
import Button from "@/components/ui/Button";

// --- TYPE DEFINITIONS (based on new API response) ---

interface SubjectScore {
  subject: string;
  score: number;
  correctCount: number;
  totalCount: number;
}

interface Result {
  id: number;
  title: string;
  score: number;
  date: string;
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  subjectScores: SubjectScore[];
  isPass: boolean;
  type: "exam" | "cbt";
  questions: Question[];
  userAnswers: { [key: string]: string | null };
}

interface ApiGichulQna {
  id: number;
  subject: string;
  qnum: number;
  questionstr: string;
  ex1str: string;
  ex2str: string;
  ex3str: string;
  ex4str: string;
  answer: string;
  explanation: string;
  imgPaths?: string[];
  gichulset_id: number;
}

interface ApiResultItem {
  correct: boolean;
  id: number;
  choice: string | null;
  gichul_qna: ApiGichulQna;
}

interface ApiResult {
  resultset_id: number;
  exam_date: string;
  duration_sec: number;
  exam_detail: string;
  examtype: "exam" | "cbt";
  total_amount_of_questions: number;
  total_correct_counts: number;
  total_average: number;
  if_passed_test: boolean;
  subject_scores: Record<
    string,
    { question_counts: number; correct_counts: number }
  >;
  results: ApiResultItem[];
}

// --- UI COMPONENTS (re-used from previous version) ---

const COLORS = { score: "#2563eb", remaining: "#4b5563" };

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className={`flex items-center justify-between text-sm`}>
    <div className="flex items-center gap-2 text-neutral-300">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

const OverallSummary = ({
  score,
  isPass,
}: {
  score: number;
  isPass: boolean;
}) => {
  const data = [
    { name: "점수", value: score },
    { name: "부족한 점수", value: 100 - score },
  ];
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">종합 점수</h3>
      <div className="w-full h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              dataKey="value"
              stroke="none"
              paddingAngle={5}
              cornerRadius={10}
            >
              <Cell key="cell-0" fill={COLORS.score} />
              <Cell key="cell-1" fill={COLORS.remaining} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className="text-5xl font-bold text-blue-400"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {score}
          </motion.span>
          <span className="text-neutral-400 text-sm">점</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`mt-6 p-3 rounded-lg flex items-center justify-center gap-2 text-lg font-bold text-center ${
          isPass
            ? "bg-blue-500/20 text-blue-300"
            : "bg-red-500/20 text-red-300"
        }`}
      >
        {isPass ? <BadgeCheck size={22} /> : <XCircle size={22} />}
        <span>{isPass ? "합격입니다." : "불합격입니다."}</span>
      </motion.div>
    </div>
  );
};

const ExamSummaryCard = ({
  timeTaken,
  correctCount,
  incorrectCount,
  unansweredCount,
  weakestSubject,
}: {
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  weakestSubject: { subject: string; score: number } | null;
}) => (
  <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
    <h3 className="text-xl font-bold mb-4">시험 요약</h3>
    <div className="space-y-3 flex-1 flex flex-col justify-center">
      <StatItem
        icon={<Clock size={16} />}
        label="총 풀이 시간"
        value={formatTime(timeTaken)}
      />
      <StatItem
        icon={<Check size={16} className="text-green-500" />}
        label="정답"
        value={correctCount}
      />
      <StatItem
        icon={<X size={16} className="text-red-500" />}
        label="오답"
        value={incorrectCount}
      />
      <StatItem
        icon={<HelpCircle size={16} className="text-gray-500" />}
        label="미답"
        value={unansweredCount}
      />
    </div>
    {weakestSubject && (
      <div className="mt-4 pt-4 border-t border-neutral-700">
        <div className="flex items-center gap-2 text-sm text-yellow-400">
          <AlertTriangle size={16} />
          <h4 className="font-semibold">가장 취약한 과목</h4>
        </div>
        <p className="text-neutral-200 mt-1 pl-2">
          {weakestSubject.subject} ({weakestSubject.score}점)
        </p>
      </div>
    )}
  </div>
);

const SubjectBreakdownCard = ({
  subjectResults,
}: {
  subjectResults: SubjectScore[];
}) => (
  <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full">
    <h3 className="text-xl font-bold mb-4">과목별 성취도</h3>
    <div className="space-y-4">
      {subjectResults.map((result) => {
        const isPass = result.score >= 60;
        return (
          <div key={result.subject}>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-semibold flex items-center gap-1.5">
                {isPass ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-red-500" />
                )}
                {result.subject}
              </span>
              <span className="text-neutral-300">
                {result.score}% ({result.correctCount}/{result.totalCount})
              </span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2.5">
              <div
                className={`${
                  isPass ? "bg-green-600" : "bg-red-600"
                } h-2.5 rounded-full`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// --- DATA FETCHING & TRANSFORMATION ---

const transformApiResult = (apiResult: ApiResult): Result => {
  // For CBTs, re-number questions sequentially per subject based on their original order.
  if (apiResult.examtype === 'cbt') {
    const subjectGroups = new Map<string, ApiResultItem[]>();
    // 1. Group questions by subject, preserving original order
    apiResult.results.forEach(item => {
        const subject = item.gichul_qna.subject;
        if (!subjectGroups.has(subject)) {
            subjectGroups.set(subject, []);
        }
        subjectGroups.get(subject)!.push(item);
    });

    // 2. Re-assign qnum sequentially within each subject group
    subjectGroups.forEach(items => {
        items.forEach((item, index) => {
            item.gichul_qna.qnum = index + 1;
        });
    });
  }

  const userAnswers: { [key: string]: string | null } = {};
  apiResult.results.forEach((item) => {
    const key = `${item.gichul_qna.subject}-${item.gichul_qna.qnum}`;
    userAnswers[key] = item.choice;
  });

  const qnaItems: QnaItem[] = apiResult.results.map((r) => ({
    ...r.gichul_qna,
    id: r.id,
  }));

  const subjectGroups = transformData(qnaItems);
  let questions = subjectGroups.flatMap((group) => group.questions);

  questions.forEach((q) => {
    const originalResult = apiResult.results.find((r) => r.id === q.id);
    q.isCorrect = originalResult?.correct;
  });

  const subjectScores: SubjectScore[] = Object.entries(
    apiResult.subject_scores
  ).map(([subject, details]) => ({
    subject,
    score:
      details.question_counts > 0
        ? Math.round((details.correct_counts / details.question_counts) * 100)
        : 0,
    correctCount: details.correct_counts,
    totalCount: details.question_counts,
  }));

  const totalAnswered = apiResult.results.filter((r) => r.choice !== null).length;
  const incorrectCount = totalAnswered - apiResult.total_correct_counts;

  return {
    id: apiResult.resultset_id,
    title: apiResult.exam_detail.includes("소형선박조종사")
      ? apiResult.exam_detail.replace(" 0급", "").trim()
      : apiResult.exam_detail,
    score: Math.round(apiResult.total_average),
    date: new Date(apiResult.exam_date).toLocaleString(),
    timeTaken: apiResult.duration_sec,
    correctCount: apiResult.total_correct_counts,
    incorrectCount: incorrectCount,
    unansweredCount: apiResult.total_amount_of_questions - totalAnswered,
    subjectScores,
    isPass: apiResult.if_passed_test,
    type: apiResult.examtype,
    questions,
    userAnswers,
  };
};

async function fetchResultById(id: number, token: string): Promise<Result | null> {
  const fetchWithToken = (url: string) =>
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

  try {
    const res = await fetchWithToken(`/api/results/${id}`);
    if (res.ok) {
      const data: ApiResult = await res.json();
      return transformApiResult(data);
    }
  } catch (e) {
    console.error(`Failed to fetch result for id ${id}:`, e);
  }

  return null;
}

// --- MAIN PAGE COMPONENT ---

export default function ExamResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      const id = parseInt(params.id as string, 10);
      if (isNaN(id)) {
        setError("유효하지 않은 결과 ID입니다.");
        setLoading(false);
        return;
      }

      const token = sessionStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/sign-in");
        return;
      }

      try {
        const foundResult = await fetchResultById(id, token);
        if (foundResult) {
          setResult(foundResult);
        } else {
          setError(
            "결과를 찾을 수 없습니다. API 엔드포인트가 응답하지 않거나 해당 ID의 결과가 없습니다."
          );
        }
      } catch (e) {
        console.error("Failed to fetch result:", e);
        setError("결과를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [params.id, router]);

  const filteredQuestions = useMemo(() => {
    if (!result) return [];
    let questions = result.questions;
    if (showOnlyWrong) {
      questions = questions.filter((q) => !q.isCorrect);
    }
    
    if (selectedSubject === "all") {
      // Sort by subject name, then by question number for consistent grouping
      return [...questions].sort((a, b) => {
        if (a.subjectName < b.subjectName) return -1;
        if (a.subjectName > b.subjectName) return 1;
        return a.num - b.num;
      });
    } else {
      return questions.filter((q) => q.subjectName === selectedSubject);
    }
  }, [result, selectedSubject, showOnlyWrong]);

  const handleRetry = () => {
    alert("다시 풀기 기능은 해당 결과 페이지에서 지원하지 않습니다.");
  };

  if (loading) {
    return (
      <div className="bg-neutral-900 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-900 flex flex-col items-center justify-center min-h-screen text-red-400">
        <p>{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  if (!result) return null;

  const weakestSubject = [...result.subjectScores].sort(
    (a, b) => a.score - b.score
  )[0];

  const subjectNames = result.subjectScores.map((s) => s.subject);
  let lastSubject: string | null = null;

  return (
    <div
      ref={scrollContainerRef}
      className="bg-neutral-900 h-screen overflow-auto"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-35">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{result.title}</h1>
            <p className="text-neutral-400">{result.date}</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            <span className="ml-2">뒤로 가기</span>
          </Button>
        </div>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <div className="md:col-span-1 lg:col-span-1">
            <OverallSummary score={result.score} isPass={result.isPass} />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <ExamSummaryCard
              timeTaken={result.timeTaken}
              correctCount={result.correctCount}
              incorrectCount={result.incorrectCount}
              unansweredCount={result.unansweredCount}
              weakestSubject={weakestSubject}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <SubjectBreakdownCard subjectResults={result.subjectScores} />
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-6">
            <ProblemReviewHeader
              subjectNames={subjectNames}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              showOnlyWrong={showOnlyWrong}
              setShowOnlyWrong={setShowOnlyWrong}
              onRetry={handleRetry}
            />
          </div>
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredQuestions.map((question, index) => {
                const showDivider =
                  selectedSubject === "all" &&
                  (lastSubject === null || lastSubject !== question.subjectName);
                lastSubject = question.subjectName;
                return (
                  <React.Fragment key={question.id}>
                    {showDivider && (
                      <div
                        className="col-span-full border-t border-neutral-700/70 my-8 flex items-center gap-3"
                      >
                        <span className="inline-flex items-center gap-2 text-base md:text-lg font-semibold tracking-tight px-4 py-1 rounded-full text-white shadow-none backdrop-blur-sm">
                          <BookOpen size={18} />
                          {question.subjectName}
                        </span>
                      </div>
                    )}
                    <QuestionResultCard
                      question={question}
                      userAnswer={
                        result.userAnswers[
                          `${question.subjectName}-${question.num}`
                        ] ?? undefined
                      }
                      index={index}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-neutral-800 rounded-lg">
              <p className="text-neutral-400">선택한 조건에 해당하는 문제가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      <ScrollToTopButton
        className="fixed bottom-6 right-6 lg:right-15 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
        scrollableRef={scrollContainerRef}
      />
    </div>
  );
}