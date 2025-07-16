"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface CbtStartActionProps {
  onStartClick: () => void;
  isReady: boolean;
  isLoading: boolean;
  error: string;
}

export function CbtStartAction({
  onStartClick,
  isReady,
  isLoading,
  error,
}: CbtStartActionProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mt-4" // SubjectSelector와 간격을 주기 위해 mt-4 추가
    >
      <Button
        onClick={onStartClick}
        disabled={!isReady || isLoading}
        className="w-full text-lg py-3 tracking-wide cursor-pointer"
      >
        {isLoading ? "불러오는 중..." : "시험 시작하기"}
      </Button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}