"use client";

import React from "react";
import { motion } from "framer-motion";

const SubjectButton = React.memo(function SubjectButton({
  subject,
  isSelected,
  onToggle,
}: {
  subject: string;
  isSelected: boolean;
  onToggle: (subject: string) => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onToggle(subject)}
      className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-200 cursor-pointer
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-500"
            : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
        }`}
      whileTap={{ scale: 0.95 }}
    >
      {subject}
    </motion.button>
  );
});

interface SubjectSelectorProps {
  subjects: string[];
  selectedSubjects: string[];
  onToggleSubject: (subject: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SubjectSelector({
  subjects,
  selectedSubjects,
  onToggleSubject,
  onSelectAll,
  onDeselectAll,
}: SubjectSelectorProps) {
  if (subjects.length === 0) {
    return (
      <p className="text-gray-400 text-xs">
        선택한 자격증/급수에 해당하는 과목 정보가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">다중 선택 가능</p>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            전체 선택
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            전체 해제
          </button>
        </div>
      </div>

      <motion.div
        layout
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1"
      >
        {subjects.map((subject) => (
          <SubjectButton
            key={subject}
            subject={subject}
            isSelected={selectedSubjects.includes(subject)}
            onToggle={onToggleSubject}
          />
        ))}
      </motion.div>
      <p className="text-xs text-gray-400 text-right">
        선택된 과목:{" "}
        <span className="text-blue-400 font-semibold">
          {selectedSubjects.length} / {subjects.length}
        </span>
      </p>
    </div>
  );
}
