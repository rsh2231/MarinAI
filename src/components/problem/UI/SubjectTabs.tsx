"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  subjects: string[];
  selected: string | null;
  setSelected: (v: string) => void;
  variant?: "default" | "header";
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
      className={`flex-shrink-0 py-3 mx-1 whitespace-nowrap border-b-2 font-semibold text-sm transition-all duration-150 scroll-snap-start px-4 sm:px-5 ${
        isSelected
          ? "border-blue-500 text-blue-400"
          : "border-transparent text-gray-400 hover:text-blue-300"
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
  variant = "default",
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

  const variantClasses = variant === "default"
    ? "border-b border-gray-700"
    : "";

  return (
    <div className={`w-full overflow-x-auto scrollbar-hide px-2 sm:px-4`}>
      <div
        className={`flex w-max scroll-snap-x scroll-snap-mandatory gap-1 sm:gap-2 mx-auto ${variantClasses}`}
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
    </div>
  );
});

export default SubjectTabs;
