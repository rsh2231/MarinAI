import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Lottie from "lottie-react";
import think from "@/assets/animations/think.json";

interface SubmitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  totalCount: number;
  answeredCount: number;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({ onConfirm, onCancel, totalCount, answeredCount }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-[#1e293b] rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700"
    >
      <div className="text-center">
        <Lottie animationData={think}
          className="w-25 h-25 mx-auto mb-4"/>
        <h3 className="text-lg font-bold">답안을 제출하시겠습니까?</h3>
        <p className="text-sm text-gray-400 mt-2">
          {totalCount > answeredCount
            ? `아직 풀지 않은 ${totalCount - answeredCount}개의 문제가 있습니다.`
            : '모든 문제를 다 푸셨습니다.'
          }
        </p>
        <p className="text-sm text-gray-400">제출 후에는 수정할 수 없습니다.</p>
      </div>
      <div className="mt-6 flex gap-3">
        <Button onClick={onCancel} variant="neutral" className="flex-1 justify-center">취소</Button>
        <Button onClick={onConfirm} variant="primary" className="flex-1 justify-center">제출</Button>
      </div>
    </motion.div>
  </motion.div>
);