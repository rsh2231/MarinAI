"use client";

import Button from "@/components/ui/Button";
import { Eye, EyeOff, RotateCcw } from "lucide-react";

interface OptionsCardProps {
  onRetry: () => void;
  showOnlyWrong: boolean;
  setShowOnlyWrong: (value: boolean) => void;
}

export const OptionsCard = ({ onRetry, showOnlyWrong, setShowOnlyWrong }: OptionsCardProps) => {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg space-y-3 h-full flex flex-col justify-center">
      <h3 className="text-xl font-bold mb-2">다시보기 옵션</h3>
      <Button
        variant="neutral"
        onClick={() => setShowOnlyWrong(!showOnlyWrong)}
        className="w-full flex items-center justify-center gap-2"
      >
        {showOnlyWrong ? <Eye size={18} /> : <EyeOff size={18} />}
        <span>{showOnlyWrong ? "전체 문제 보기" : "틀린 문제만 보기"}</span>
      </Button>
      <Button
        variant="primary"
        onClick={onRetry}
        className="w-full flex items-center justify-center gap-2"
      >
        <RotateCcw size={18} />
        <span>다시 풀기</span>
      </Button>
    </div>
  );
};