"use client";

import { motion, Variants } from "framer-motion";
import { useSchedules } from "@/hooks/useSchedules";
import { ScheduleSection } from "./ScheduleSection";
import {
  Schedule,
  REGULAR_COLUMNS,
  INTERVIEW_COLUMNS,
  WRITTEN_COLUMNS,
} from "@/types/Schedule";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import { RefObject } from "react";

interface ScheduleComponentProps {
  scrollableRef: RefObject<HTMLDivElement | null>;
}

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

export default function ScheduleComponent({
  scrollableRef,
}: ScheduleComponentProps) {
  const { schedules, isLoading, error } = useSchedules();

  const groupBySection = (section: Schedule["section"]) =>
    schedules.filter((s) => s.section === section);

  if (isLoading) {
    return <LoadingSpinner text="시험 일정을 불러오는 중입니다..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 bg-danger/10 text-danger rounded-lg text-center">
        <strong>⚠️ {error}</strong>
      </div>
    );
  }

  return (
    <main
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 break-keep relative"
      style={{ minHeight: 600 }}
    >
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
      <ScrollToTopButton
        className="fixed bottom-6 right-6 lg:right-15 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
        scrollableRef={scrollableRef}
      />
    </main>
  );
}
