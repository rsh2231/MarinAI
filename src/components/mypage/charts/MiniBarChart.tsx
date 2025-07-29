// 과목별 점수 차트
"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function MiniBarChart({
  data,
}: {
  data: { subject: string; score: number }[];
}) {
  const isMobile = useIsMobile(400);
  const barSize = isMobile ? 18 : 20;
  const barCategoryGap = isMobile ? "10%" : "8%";
  const fontSize = isMobile ? 10 : 14;
  const labelFontSize = isMobile ? 10 : 14;
  const angle = isMobile ? -30 : 0;

  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg h-28 sm:h-36 md:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ left: 0, right: 35, top: 10, bottom: 10 }}
            barCategoryGap={barCategoryGap}
            barSize={barSize}
          >
            <XAxis
              dataKey="subject"
              tick={{ fill: "#e0e0e0", fontSize }}
              angle={angle}
              dy={10}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#aaa", fontSize: fontSize - 2 }}
            />
            <Bar
              dataKey="score"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              label={{ fill: "#fff", fontSize: labelFontSize, position: "top" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
