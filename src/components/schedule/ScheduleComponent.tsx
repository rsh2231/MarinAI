"use client";

// ✅ framer-motion에서 Variants 타입을 함께 import 합니다.
import { motion, Variants } from "framer-motion";
import { useSchedules } from "@/hooks/useSchedules";
import { ScheduleSection } from "./ScheduleSection";
import {
  Schedule,
  REGULAR_COLUMNS,
  INTERVIEW_COLUMNS,
  WRITTEN_COLUMNS,
} from "@/types/Schedule";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

export default function SchedulePage() {
  const { schedules, isLoading, error } = useSchedules();

  const groupBySection = (section: Schedule["section"]) =>
    schedules.filter((s) => s.section === section);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-foreground/70">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>시험 일정을 불러오는 중입니다...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 bg-danger/10 text-danger rounded-lg text-center">
        <strong>⚠️ {error}</strong>
      </div>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 break-keep">
      <motion.header
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-12 md:mb-20 text-center"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          해기사 시험 일정
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
          2025년도 정기 및 상시 시험 일정을 확인하세요.
        </p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-16"
      >
        <motion.div variants={itemVariants}>
          <ScheduleSection
            title="정기시험"
            accentColor="primary"
            schedules={groupBySection("정기시험")}
            columns={REGULAR_COLUMNS}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ScheduleSection
            title="상시시험 (면접)"
            accentColor="success"
            schedules={groupBySection("상시시험(면접)")}
            columns={INTERVIEW_COLUMNS}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ScheduleSection
            title="상시시험 (필기)"
            accentColor="secondary"
            schedules={groupBySection("상시시험(필기)")}
            columns={WRITTEN_COLUMNS}
          />
        </motion.div>
      </motion.div>
    </main>
  );
}