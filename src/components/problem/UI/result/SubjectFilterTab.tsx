"use client";

import { motion } from "framer-motion";

interface SubjectFilterTabsProps {
  subjectNames: string[];
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
}

export const SubjectFilterTabs = ({
  subjectNames,
  selectedSubject,
  setSelectedSubject,
}: SubjectFilterTabsProps) => {
  const tabs = [
    { label: "전체", value: "all" },
    ...subjectNames.map((name) => ({ label: name, value: name })),
  ];

  return (
    <div className="flex space-x-6 border-b border-neutral-700">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setSelectedSubject(tab.value)}
          className={`relative py-2 px-1 text-sm font-medium transition-colors
            ${
              selectedSubject === tab.value
                ? "text-white"
                : "text-neutral-400 hover:text-white"
            }
          `}
        >
          {/* 탭 텍스트 */}
          {tab.label}

          {/* 선택된 탭 아래에만 밑줄 렌더링 및 애니메이션 */}
          {selectedSubject === tab.value && (
            <motion.div
              className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500"
              layoutId="active-subject-underline"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};
