"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  subjects: string[];
  selected: string | null;
  setSelected: (v: string) => void;
}

const SubjectButton = React.memo(function SubjectButton({
  subj,
  isSelected,
  onClick,
  buttonRef,
}: {
  subj: string;
  isSelected: boolean;
  onClick: () => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`flex-shrink-0 px-5 py-3 sm:px-6 sm:py-3 mx-1 whitespace-nowrap border-b-2 font-semibold text-sm transition-all duration-150 scroll-snap-start
        ${
          isSelected
            ? "border-blue-500 text-blue-400"
            : "border-transparent text-gray-400 hover:text-blue-300 hover:border-blue-300"
        }`}
    >
      {subj.replace(/^\d+\.\s*/, "")}
    </button>
  );
});

const SubjectTabs = React.memo(function SubjectTabs({
  subjects,
  selected,
  setSelected,
}: Props) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!selected) return;
    const index = subjects.findIndex((s) => s === selected);
    const button = buttonRefs.current[index];
    if (button) {
      button.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selected, subjects]);

  return (
    <div
      className="flex items-center justify-start border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide px-2 sm:px-0 scroll-snap-x"
      style={{ WebkitOverflowScrolling: "touch", scrollPaddingLeft: "1rem" }}
    >
      {subjects.map((subj, i) => (
        <SubjectButton
          key={subj}
          subj={subj}
          isSelected={subj === selected}
          onClick={() => setSelected(subj)}
          buttonRef={(el) => {
            buttonRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
});

export default SubjectTabs;
