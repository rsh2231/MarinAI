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

const data = [
  { subject: "기관1", A: 85, fullMark: 100 },
  { subject: "기관2", A: 93, fullMark: 100 },
  { subject: "기관3", A: 78, fullMark: 100 },
  { subject: "직무일반", A: 70, fullMark: 100 },
  { subject: "영어", A: 65, fullMark: 100 },
];

export default function PerformanceRadarChart() {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
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
