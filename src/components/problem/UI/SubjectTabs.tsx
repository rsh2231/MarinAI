"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  subjects: string[];
  selected: string | null;
  setSelected: (v: string) => void;
  /** 탭의 스타일 종류를 지정합니다. 'default'는 일반 문제풀이용, 'header'는 시험 헤더용입니다. */
  variant?: 'default' | 'header';
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
  variant = 'default', // prop의 기본값을 'default'로 설정
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

  const baseClasses = "flex items-center justify-start overflow-x-auto scrollbar-hide scroll-snap-x";
  // variant에 따라 다른 클래스를 적용합니다.
  const variantClasses = variant === 'default'
    ? "border-b border-gray-700" // ProblemViewer용 기존 스타일
    : ""; // ExamViewer용 신규 스타일 (추가 클래스 없음)

  return (
    <div
      className={`${baseClasses} ${variantClasses}`}
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