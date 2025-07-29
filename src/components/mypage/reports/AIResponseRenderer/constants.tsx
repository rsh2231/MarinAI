import React from "react";
import { Variants } from "framer-motion";
import { AlertTriangle, BookOpen, TrendingUp } from "lucide-react";

// 아이콘 매핑
export const sectionIcons: { [key: string]: React.ReactNode } = {
  "자주 틀리는": <AlertTriangle className="w-5 h-5 text-amber-400" />,
  "전반적인 학습 상태": <BookOpen className="w-5 h-5 text-sky-400" />,
  "보완이 필요한 영역": <TrendingUp className="w-5 h-5 text-emerald-400" />,
};

// 애니메이션 Variants
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};