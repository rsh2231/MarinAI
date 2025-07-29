"use client";

import { motion, Variants } from "framer-motion";
import { RefObject } from "react";
import { useSchedules } from "@/hooks/useSchedules";
import { Schedule } from "@/types/Schedule";
import { ScheduleSection } from "./ScheduleSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";


interface ScheduleComponentProps {
  scrollableRef: RefObject<HTMLDivElement | null>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

export default function ScheduleComponent({
  scrollableRef,
}: ScheduleComponentProps) {
  const { schedules, isLoading, error } = useSchedules();

  const groupBySection = (
    data: Schedule[],
    section: Schedule["section"]
  ): Schedule[] => {
    return data.filter((s) => s.section === section);
  };

  // 각 섹션별 안내 문구
  const descriptions = {
    regular: [
      "회별 시행지역, 지역별 시행 직종 및 등급을 공고문에서 꼭 확인하시기 바랍니다. (시험일 기준 1개월 전 게시)",
      "접수시간: 접수시작일 10:00 ~ 접수마감일 18:00",
    ],
    interview: [
      "해기사 시험 일정은 사정에 따라 변경될 수 있으므로 매회 공고문을 확인하시기 바랍니다. (시험일 기준 15일 전 게시)",
      "접수시간: 접수시작일 10:00 ~ 접수마감일 18:00",
    ],
    written: [
      "회별 시행 지역, 직종 및 등급 등 세부사항은 월별 상시시험 공고문을 반드시 확인하시기 바랍니다. (시험일 기준 15일 전 게시)",
      "접수시간: 접수시작일 10:00 ~ 접수마감일 18:00 (정원이 마감된 경우 접수시간이 남아 있더라도 접수 불가)",
    ],
  };

  if (isLoading) {
    return <LoadingSpinner text="시험 일정을 불러오는 중입니다..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 bg-red-500/10 text-red-400 rounded-lg text-center">
        <strong>⚠️ {error}</strong>
      </div>
    );
  }

  return (
    <main
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      style={{ minHeight: "calc(100vh - 200px)" }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-16"
      >
        <motion.div variants={itemVariants}>
          <ScheduleSection
            title="정기시험"
            schedules={groupBySection(schedules, "정기시험")}
            description={descriptions.regular}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ScheduleSection
            title="상시시험 (면접)"
            schedules={groupBySection(schedules, "상시시험(면접)")}
            description={descriptions.interview}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ScheduleSection
            title="상시시험 (필기)"
            schedules={groupBySection(schedules, "상시시험(필기)")}
            description={descriptions.written}
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
