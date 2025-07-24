import Lottie from "lottie-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import question from "@/assets/animations/question.json";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ModeSelectionPromptProps {
  isFilterReady: boolean;
  onModeSelect: (mode: "practice" | "exam") => void;
}

export default function ModeSelectionPrompt({ isFilterReady, onModeSelect }: ModeSelectionPromptProps) {
  const isMobile = useIsMobile(768);

  const promptMessage = isFilterReady
    ? "아래에서 모드를 선택하여 시험을 시작하세요!"
    : isMobile
    ? "햄버거 버튼을 눌러 시험 정보를 선택하세요."
    : "사이드바에서 시험 정보를 선택하세요.";

  return (
    <motion.div
      key="mode-selection-prompt"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center px-6 h-full"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-lg border border-gray-700 bg-[#1e293b] p-6 text-center shadow-lg sm:p-10">
        <Lottie animationData={question} className="h-20 w-20" />
        <p className="my-6 break-keep text-base font-medium leading-relaxed text-gray-300">
          {promptMessage}
        </p>
        
        {isFilterReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4"
          >
            <Button onClick={() => onModeSelect("practice")} variant="neutral" size="md">
              연습 모드
            </Button>
            <Button onClick={() => onModeSelect("exam")} variant="neutral" size="md">
              실전 모드
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}