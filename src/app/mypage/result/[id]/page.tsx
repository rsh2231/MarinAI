"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Check, X, HelpCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { BadgeCheck, XCircle } from "lucide-react";
import { QuestionResultCard } from "@/components/problem/result/QuestionResultCard";
import { transformData } from "@/lib/problem-utils";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

// API route와 동일한 더미데이터
const dummyResults = [
  {
    id: 1,
    title: "2023년 기관사 1급 1회 기출",
    score: 88,
    date: "2025-07-16",
    timeTaken: 7200,
    correctCount: 44,
    incorrectCount: 6,
    unansweredCount: 0,
    subjectScores: [
      { subject: "기관1", score: 85, correctCount: 17, totalCount: 20 },
      { subject: "기관2", score: 90, correctCount: 18, totalCount: 20 },
      { subject: "기관3", score: 78, correctCount: 7, totalCount: 9 },
      { subject: "직무일반", score: 70, correctCount: 7, totalCount: 10 },
      { subject: "영어", score: 65, correctCount: 2, totalCount: 3 },
    ],
    userAnswers: {},
  },
  {
    id: 2,
    title: "2023년 기관사 1급 2회 기출",
    score: 82,
    date: "2025-07-11",
    timeTaken: 6900,
    correctCount: 41,
    incorrectCount: 9,
    unansweredCount: 0,
    subjectScores: [
      { subject: "기관1", score: 80, correctCount: 16, totalCount: 20 },
      { subject: "기관2", score: 85, correctCount: 17, totalCount: 20 },
      { subject: "기관3", score: 72, correctCount: 6, totalCount: 9 },
      { subject: "직무일반", score: 68, correctCount: 7, totalCount: 10 },
      { subject: "영어", score: 60, correctCount: 2, totalCount: 3 },
    ],
    userAnswers: {},
  },
  {
    id: 3,
    title: "2023년 기관사 1급 3회 기출",
    score: 90,
    date: "2024-07-16",
    timeTaken: 7500,
    correctCount: 45,
    incorrectCount: 5,
    unansweredCount: 0,
    subjectScores: [
      { subject: "기관1", score: 88, correctCount: 17, totalCount: 20 },
      { subject: "기관2", score: 92, correctCount: 18, totalCount: 20 },
      { subject: "기관3", score: 80, correctCount: 7, totalCount: 9 },
      { subject: "직무일반", score: 75, correctCount: 7, totalCount: 10 },
      { subject: "영어", score: 70, correctCount: 2, totalCount: 3 },
    ],
    userAnswers: {},
  },
];

const COLORS = {
  score: "#2563eb",
  remaining: "#4b5563",
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const StatItem = ({ icon, label, value, className = "" }: { icon: React.ReactNode, label: string, value: string | number, className?: string }) => (
  <div className={`flex items-center justify-between text-sm ${className}`}>
    <div className="flex items-center gap-2 text-neutral-300">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

const OverallSummary = ({ score, isPass }: { score: number, isPass: boolean }) => {
  if (score === null) return null;

  const remaining = 100 - score;
  const data = [
    { name: "점수", value: score },
    { name: "부족한 점수", value: remaining },
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
        className={`mt-6 p-3 rounded-lg flex items-center justify-center gap-2 text-lg font-bold text-center
          ${
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

const ExamSummaryCard = ({ timeTaken, correctCount, incorrectCount, unansweredCount, weakestSubject }: {
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  weakestSubject: { subject: string; score: number } | null;
}) => {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">시험 요약</h3>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <StatItem icon={<Clock size={16} />} label="총 풀이 시간" value={formatTime(timeTaken)} />
        <StatItem icon={<Check size={16} className="text-green-500" />} label="정답" value={correctCount} />
        <StatItem icon={<X size={16} className="text-red-500" />} label="오답" value={incorrectCount} />
        <StatItem icon={<HelpCircle size={16} className="text-gray-500" />} label="미답" value={unansweredCount} />
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
};

const SubjectBreakdownCard = ({ subjectResults }: { subjectResults: Array<{ subject: string; score: number; correctCount: number; totalCount: number }> }) => {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">과목별 성취도</h3>
      <div className="space-y-4">
        {subjectResults.map(result => {
          const isPass = result.score >= 60;
          return (
            <div key={result.subject}>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold flex items-center gap-1.5">
                  {isPass ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                  {result.subject}
                </span>
                <span className="text-neutral-300">{result.score}% ({result.correctCount}/{result.totalCount})</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2.5">
                <div 
                  className={`${isPass ? 'bg-green-600' : 'bg-red-600'} h-2.5 rounded-full`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ExamResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const foundResult = dummyResults.find(r => r.id === parseInt(id));
    
    if (foundResult) {
      setResult(foundResult);
    } else {
      router.push('/mypage');
    }
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!result) return;
      
      try {
        setQuestionsLoading(true);
        const token = sessionStorage.getItem("access_token");
        
        const params = new URLSearchParams({
          examtype: "exam",
          year: "2023",
          license: "기관사",
          level: "1",
          round: "1",
        });

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`/api/solve?${params.toString()}`, {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          throw new Error("문제를 불러오는데 실패했습니다.");
        }

        const responseData = await res.json();
        const transformedQuestions = transformData(responseData.qnas);
        
        const allQuestions = transformedQuestions.flatMap(group => 
          group.questions.map(question => ({
            ...question,
            subjectName: group.subjectName
          }))
        );
        
        const updatedUserAnswers = { ...result.userAnswers };
        allQuestions.forEach(question => {
          const key = `${question.subjectName}-${question.num}`;
          if (question.answer) {
            updatedUserAnswers[key] = question.answer;
          }
        });
        
        setResult((prevResult: any) => ({
          ...prevResult,
          userAnswers: updatedUserAnswers
        }));
        
        setQuestions(allQuestions);
      } catch (error) {
        console.error("문제 fetch 실패:", error);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [result?.id]);

  if (loading) {
    return (
      <div className="bg-neutral-900 flex items-center justify-center min-h-screen">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isPass = result.score >= 60;
  const weakestSubject = result.subjectScores.reduce((min: any, current: any) => 
    current.score < min.score ? current : min
  );

  return (
    <div ref={scrollContainerRef} className="bg-neutral-900 h-screen overflow-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-35">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            뒤로 가기
          </button>
          <h1 className="text-3xl font-bold mb-2">{result.title}</h1>
          <p className="text-neutral-400">{result.date}</p>
        </div>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <div className="md:col-span-1 lg:col-span-1">
            <OverallSummary score={result.score} isPass={isPass} />
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
          <h2 className="text-2xl font-bold mb-6">문제 리뷰</h2>
          {questionsLoading ? (
            <div className="text-center py-8">
              <div className="text-neutral-400">문제를 불러오는 중...</div>
            </div>
          ) : questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {questions.map((question, index) => (
                <QuestionResultCard
                  key={`${question.subjectName}-${question.num}`}
                  question={question}
                  userAnswer={result.userAnswers?.[`${question.subjectName}-${question.num}`]}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-neutral-400">문제 데이터가 없습니다.</div>
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