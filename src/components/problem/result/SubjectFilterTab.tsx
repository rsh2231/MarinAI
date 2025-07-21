"use client";

import React, { useRef, useEffect } from "react";
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

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = tabs.findIndex((tab) => tab.value === selectedSubject);
    if (idx !== -1 && tabRefs.current[idx]) {
      tabRefs.current[idx]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedSubject, tabs]);

  return (
    <div className="flex overflow-x-auto no-scrollbar space-x-2 sm:space-x-6 border-b border-neutral-700 pb-1">
      {tabs.map((tab, i) => (
        <button
          key={tab.value}
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          onClick={() => setSelectedSubject(tab.value)}
          className={`
            relative py-2 px-3 text-sm font-medium transition-colors
            min-w-[80px] max-w-[120px] truncate
            ${
              selectedSubject === tab.value
                ? "text-white"
                : "text-neutral-400 hover:text-white"
            }
          `}
        >
          {tab.label}
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
