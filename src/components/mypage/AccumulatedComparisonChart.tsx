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

// 더미 데이터: 일자별, 과목별 점수 (기관1, 기관2, 기관3, 직무일반, 영어)
const data = [
  {
    date: "2024-06-01",
    기관1: 72,
    기관2: 88,
    기관3: 65,
    직무일반: 58,
    영어: 55,
  },
  {
    date: "2024-06-10",
    기관1: 75,
    기관2: 90,
    기관3: 68,
    직무일반: 60,
    영어: 58,
  },
  {
    date: "2024-06-20",
    기관1: 80,
    기관2: 87,
    기관3: 74,
    직무일반: 66,
    영어: 62,
  },
  {
    date: "2024-07-01",
    기관1: 85,
    기관2: 93,
    기관3: 78,
    직무일반: 70,
    영어: 65,
  },
];

const SUBJECTS = ["기관1", "기관2", "기관3", "직무일반", "영어"];
const COLORS = ["#3b82f6", "#f59e42", "#10b981", "#f43f5e", "#6366f1"];

export default function AccumulatedComparisonChart() {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 pb-8">
      <h3 className="text-xl font-bold mb-2 sm:mb-4">과목별 점수 변화</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" tick={{ fill: '#e0e0e0', fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#aaa', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
          <Legend
            wrapperStyle={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              left: 0,
              bottom: 0,
              paddingTop: 8,
            }}
            iconSize={14}
          />
          {SUBJECTS.map((subject, idx) => (
            <Line
              key={subject}
              type="monotone"
              dataKey={subject}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              name={subject}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
 