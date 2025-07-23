"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SettingsStepProps {
  stepNumber: number;
  title: string;
  isComplete: boolean;
  isActive: boolean;
  children: React.ReactNode;
}

export function SettingsStep({
  stepNumber,
  title,
  isComplete,
  isActive,
  children,
}: SettingsStepProps) {
  const getStatusClasses = () => {
    if (isActive) return "text-blue-400";
    if (isComplete) return "text-green-400";
    return "text-gray-500";
  };

  const getIcon = () => {
    if (isComplete) return <CheckCircle size={20} />;
    if (isActive)
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {stepNumber}
        </span>
      );
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-xs font-bold text-gray-400">
        {stepNumber}
      </span>
    );
  };

  return (
    <motion.div layout className="relative pl-10">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700" />
      <div className={`absolute left-0 top-0 flex items-center gap-3 transition-colors duration-300 ${getStatusClasses()}`}>
        <div className="z-10 bg-gray-800 p-1.5 rounded-full -translate-x-1/2">
          {getIcon()}
        </div>
        <h3 className="font-semibold text-neutral-100">{title}</h3>
      </div>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="pt-10 origin-top"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}