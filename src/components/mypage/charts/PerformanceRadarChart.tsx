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

// 기출문제와 CBT 결과 데이터의 평균점수를 계산한 과목별 성취도
// 기관1: (88+80+85+80+88+85)/6 = 84.3 ≈ 84
// 기관2: (92+85+90+85+92+90)/6 = 89.0 ≈ 89
// 기관3: (80+72+78+72+80+78)/6 = 76.7 ≈ 77
// 직무일반: (75+68+70+68+75+70)/6 = 71.0 ≈ 71
// 영어: (70+60+65+60+70+65)/6 = 65.0 ≈ 65
const data = [
  { subject: "기관1", A: 84, fullMark: 100 },
  { subject: "기관2", A: 89, fullMark: 100 },
  { subject: "기관3", A: 77, fullMark: 100 },
  { subject: "직무일반", A: 71, fullMark: 100 },
  { subject: "영어", A: 65, fullMark: 100 },
];

export default function PerformanceRadarChart() {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg">
      <h3 className="flex items-center gap-2 text-xl font-bold mb-2 min-h-[40px]">
        <Pentagon size={22} className="text-primary" />
        과목별 성취도
      </h3>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
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
