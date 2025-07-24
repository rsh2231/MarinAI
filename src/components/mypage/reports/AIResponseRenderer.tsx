import React from "react";
import { motion, Variants } from "framer-motion";
import { AlertTriangle, BookOpen, TrendingUp, CheckCircle } from "lucide-react";

interface AIResponseRendererProps {
  message: string;
}

const sectionIcons: { [key: string]: React.ReactNode } = {
  "자주 틀리는 개념": <AlertTriangle className="w-5 h-5 text-amber-400" />,
  "학습 상태 진단": <BookOpen className="w-5 h-5 text-sky-400" />,
  "학습 전략 제안": <TrendingUp className="w-5 h-5 text-emerald-400" />,
  "잘하고 있는 점": <CheckCircle className="w-5 h-5 text-green-400" />,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 각 자식 요소가 0.2초 간격으로 나타남
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function AIResponseRenderer({
  message,
}: AIResponseRendererProps) {
  const lines = message.split("\n").filter((line) => line.trim() !== "");

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {lines.map((line, index) => {
        if (line.startsWith("## ")) {
          const title = line.replace("## ", "").trim();
          const Icon = Object.keys(sectionIcons).find((key) =>
            title.includes(key)
          );
          return (
            <motion.div key={index} variants={itemVariants}>
              <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 text-neutral-100 mb-2">
                {Icon ? sectionIcons[Icon] : null}
                {title}
              </h3>
            </motion.div>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-start gap-3 ml-2 sm:ml-4"
            >
              <span className="mt-[7px] flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {line.replace("- ", "").trim()}
              </p>
            </motion.div>
          );
        }

        // 일반 문단 처리
        return (
          <motion.p
            key={index}
            variants={itemVariants}
            className="text-sm sm:text-base text-neutral-300 leading-relaxed"
          >
            {line}
          </motion.p>
        );
      })}
    </motion.div>
  );
}
