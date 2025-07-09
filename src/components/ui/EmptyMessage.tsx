import { motion } from "framer-motion";
import Lottie from "lottie-react";
import alert from "@/assets/animations/alert.json";

interface EmptyMessageProps {
  icon?: string;
  title?: string;
  message?: string;
  className?: string;
  motionProps?: React.ComponentProps<typeof motion.div>;
}

export const EmptyMessage = ({
  title = "선택한 과목에 해당하는 문제가 없습니다.",
  message = "사이드바에서 과목을 선택해 보세요.",
  className = "",
  motionProps,
}: EmptyMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-gray-400 text-center mt-12 px-4 py-10 border border-gray-700 rounded-xl bg-[#1f2937]/40 shadow-inner mx-2 ${className} break-keep`}
      {...motionProps}
    >
      <Lottie animationData={alert} className="w-20 h-20" />
      <span className="text-base sm:text-lg font-medium text-blue-300">
        {title}
      </span>
      {message && <span className="text-sm text-gray-500 mt-2">{message}</span>}
    </motion.div>
  );
};
