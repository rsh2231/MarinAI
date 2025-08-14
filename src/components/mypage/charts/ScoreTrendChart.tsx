// 과목별 점수 변화
"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { ChartLine } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartResult } from "./PerformanceRadarChart";

const COLORS = ["#3b82f6", "#f59e42", "#10b981", "#f43f5e", "#6366f1"];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 400);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

interface ScoreTrendChartProps {
  examResults: ChartResult[];
  cbtResults: ChartResult[];
}

interface ChartDataItem {
  date: string;
  [subject: string]: number | string; // subject scores or date string
}

export default function ScoreTrendChart({ examResults, cbtResults }: ScoreTrendChartProps) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]); // 차트 데이터 상태
  const [subjects, setSubjects] = useState<string[]>([]); // 과목 목록 상태

  useEffect(() => {
    setIsClient(true);

    const processResults = (results: ChartResult[]) => {
      const processedData: { [key: string]: ChartDataItem } = {};
      const allSubjects = new Set<string>();

      results.forEach(result => {
        if (result.subject_scores) {
          const dateObj = new Date(result.date);
          if (isNaN(dateObj.getTime())) {
            console.warn("Invalid date encountered:", result.date);
            return;
          }
          const date = dateObj.toISOString();
          if (!processedData[date]) {
            processedData[date] = { date };
          }
          Object.entries(result.subject_scores).forEach(([subject, details]) => {
            allSubjects.add(subject);
            const score = details.question_counts > 0
              ? (details.correct_counts / details.question_counts) * 100
              : 0;
            processedData[date][subject] = Math.round(score);
          });
        }
      });

      const sortedDates = Object.keys(processedData).sort();
      const finalChartData = sortedDates.map(date => processedData[date]);

      setChartData(finalChartData);
      setSubjects(Array.from(allSubjects));
    };

    const combinedResults = [...examResults, ...cbtResults];
    processResults(combinedResults);

  }, [examResults, cbtResults]);

  if (!isClient) {
    // SSR에서는 그래프 자체를 렌더하지 않음 (로딩 스켈레톤 등 대체 가능)
    return <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg min-h-[18rem]" />;
  }

  const legendStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    paddingTop: isMobile ? 2 : 8,
    fontSize: isMobile ? 11 : 14,
    flexWrap: subjects.length > 5 ? "wrap" : "nowrap",
  };

  return (
    <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg">
      <h3 className="flex items-center gap-2 text-xl font-bold mb-2 min-h-[40px]">
        <ChartLine size={22} className="text-primary" />
        과목별 점수 변화
      </h3>
      <div className="w-full h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: isMobile ? 20 : 50,
              left: isMobile ? 0 : 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#e0e0e0", fontSize: isMobile ? 10 : 12 }}
              interval={0}
              tickMargin={10}
              tickFormatter={(tick) => new Date(tick).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })}
            />
            <YAxis domain={[0, 100]} tick={{ fill: "#aaa", fontSize: 10 }} width={32} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #444",
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                });
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={legendStyle}
              iconSize={isMobile ? 12 : 14}
            />
            {subjects.map((subject, idx) => (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ r: isMobile ? 2 : 3 }}
                activeDot={{ r: isMobile ? 4 : 6 }}
                name={subject}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}