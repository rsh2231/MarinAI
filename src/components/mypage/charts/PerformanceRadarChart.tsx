// 과목별 성취도
"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Pentagon } from "lucide-react";
import { useEffect, useState } from "react";

// ExamResult 및 CbtResult에서 필요한 필드만 정의
export interface ChartResult {
  date: string; // ISO 8601 string including time (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ")
  subject_scores: Record<string, { question_counts: number; correct_counts: number }>;
}

interface PerformanceRadarChartProps {
  examResults: ChartResult[];
  cbtResults: ChartResult[];
}

export default function PerformanceRadarChart({ examResults, cbtResults }: PerformanceRadarChartProps) {
  const [chartData, setChartData] = useState<{ subject: string; A: number; fullMark: 100 }[]>([]);

  useEffect(() => {
    const calculateData = () => {
      const subjectScores = new Map<string, { total: number; count: number }>();

      const processResults = (results: ChartResult[]) => {
        results.forEach(result => {
          if (result.subject_scores) {
            Object.entries(result.subject_scores).forEach(([subject, details]) => {
              const score = details.question_counts > 0
                ? (details.correct_counts / details.question_counts) * 100
                : 0;

              if (subjectScores.has(subject)) {
                const current = subjectScores.get(subject)!;
                subjectScores.set(subject, { total: current.total + score, count: current.count + 1 });
              } else {
                subjectScores.set(subject, { total: score, count: 1 });
              }
            });
          }
        });
      };

      processResults(examResults);
      processResults(cbtResults);

      const newChartData: { subject: string; A: number; fullMark: 100 }[] = [];
      subjectScores.forEach((value, subject) => {
        newChartData.push({
          subject,
          A: Math.round(value.total / value.count), // 평균 점수 계산 및 반올림
          fullMark: 100,
        });
      });
      return newChartData;
    };

    setChartData(calculateData());
  }, [examResults, cbtResults]); // examResults 또는 cbtResults가 변경될 때마다 재계산

  return (
    <div className="bg-neutral-800 p-6 rounded-lg">
      <h3 className="flex items-center gap-2 text-xl font-bold mb-2 min-h-[40px]">
        <Pentagon size={22} className="text-primary" />
        과목별 성취도
      </h3>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#555" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#e0e0e0", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#aaa", fontSize: 10 }}
            />
            <Radar
              name="나의 점수"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #444",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
