import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { BadgeCheck, XCircle } from "lucide-react";

const COLORS = {
  score: "#2563eb",
  remaining: "#4b5563",
};

interface OverallSummaryProps {
  score: number;
  isPass: boolean;
}

export const OverallSummary = ({ score, isPass }: OverallSummaryProps) => {
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
        <span>{isPass ? "합격입니다!" : "아쉽지만, 불합격입니다."}</span>
      </motion.div>
    </div>
  );
};
