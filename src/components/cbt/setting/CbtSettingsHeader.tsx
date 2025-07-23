"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import suffle from "@/assets/animations/suffle.json";

export function CbtSettingsHeader() {
  return (
    // ✨ 개선 사항: mb-10을 mb-8로 줄여 상단 여백을 최적화했습니다.
    <div className="flex flex-col justify-center items-center mb-10 min-h-[160px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-32 h-32 sm:w-40 sm:h-40"
      >
        <Lottie animationData={suffle} loop autoplay />
      </motion.div>
      <p className="text-sm sm:text-base text-gray-300 text-center leading-relaxed">
        선택한 자격증과 급수에 따라 <br className="sm:hidden" />
        기출문제 중 무작위로 문제가 출제됩니다. <br />
        하나 이상의 과목을 선택해주세요. <br />
        <span className="text-blue-400 font-semibold">
          시험 시작 후에는 설정을 변경할 수 없습니다.
        </span>
      </p>
    </div>
  );
}