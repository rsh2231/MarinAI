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

// 기출문제와 CBT 결과 데이터를 기반으로 한 과목별 점수 변화
const data = [
  { 
    date: "2024-07-16", 
    기관1: 88, 
    기관2: 92, 
    기관3: 80, 
    직무일반: 75, 
    영어: 70 
  },
  { 
    date: "2024-07-18", 
    기관1: 88, 
    기관2: 92, 
    기관3: 80, 
    직무일반: 75, 
    영어: 70 
  },
  { 
    date: "2025-07-11", 
    기관1: 80, 
    기관2: 85, 
    기관3: 72, 
    직무일반: 68, 
    영어: 60 
  },
  { 
    date: "2025-07-12", 
    기관1: 80, 
    기관2: 85, 
    기관3: 72, 
    직무일반: 68, 
    영어: 60 
  },
  { 
    date: "2025-07-16", 
    기관1: 85, 
    기관2: 90, 
    기관3: 78, 
    직무일반: 70, 
    영어: 65 
  },
  { 
    date: "2025-07-18", 
    기관1: 85, 
    기관2: 90, 
    기관3: 78, 
    직무일반: 70, 
    영어: 65 
  },
];

const SUBJECTS = ["기관1", "기관2", "기관3", "직무일반", "영어"];
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

export default function ScoreTrendChart() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    flexWrap: isMobile ? "wrap" : "nowrap",
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
            data={data}
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
              tickFormatter={(tick) => (isMobile ? tick.substring(5) : tick)}
            />
            <YAxis domain={[0, 100]} tick={{ fill: "#aaa", fontSize: 10 }} width={32} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #444",
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={legendStyle}
              iconSize={isMobile ? 12 : 14}
            />
            {SUBJECTS.map((subject, idx) => (
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