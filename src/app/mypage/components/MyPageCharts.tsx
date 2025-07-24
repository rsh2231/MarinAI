// app/mypage/_components/MyPageMetrics.tsx
import AccumulatedComparisonChart from "@/components/mypage/charts/ScoreTrendChart";
import PerformanceRadarChart from "@/components/mypage/charts/PerformanceRadarChart";

export default function MyPageMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-6">
      <div className="bg-neutral-800 rounded-xl p-4 md:p-6">
        <AccumulatedComparisonChart />
      </div>
      <div className="bg-neutral-800 rounded-xl p-4 md:p-6">
        <PerformanceRadarChart />
      </div>
    </div>
  );
}