"use client";

import AccumulatedComparisonChart from "@/components/mypage/charts/ScoreTrendChart";
import PerformanceRadarChart from "@/components/mypage/charts/PerformanceRadarChart";
import { motion, Variants } from "framer-motion";


const containerVariants: Variants = {
  hidden: { opacity: 1 }, // 부모는 숨기지 않음
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 자식 요소들을 0.2초 간격으로 애니메이션
    },
  },
};

// Grid 아이템을 위한 Variants
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    },
  },
};

export default function MyPageCharts() {
  return (
    // 기존 Grid 컨테이너 div를 motion.div로 변경하고 className은 그대로 유지
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible" // MyPageClient의 whileInView에 의해 이 컴포넌트가 보이면 바로 실행
    >
      {/* 각 Grid 아이템을 motion.div로 감싸고 variants를 적용 */}
      {/* 여기서 div를 motion.div로 바꿔도 레이아웃에 영향 없음 */}
      <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-4 md:p-6 h-full">
        <AccumulatedComparisonChart />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-neutral-800 rounded-xl p-4 md:p-6 h-full">
        <PerformanceRadarChart />
      </motion.div>
    </motion.div>
  );
}