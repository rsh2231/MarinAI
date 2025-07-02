"use client";

import React, { useCallback } from "react";

interface Props {
  subjects: string[];
  selected: string | null;
  setSelected: (v: string) => void;
}

// 개별 버튼 컴포넌트, selected 변경시에만 리렌더링됨
const SubjectButton = React.memo(function SubjectButton({
  subj,
  isSelected,
  onClick,
}: {
  subj: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 whitespace-nowrap border-b-2 font-medium transition-all duration-150 text-sm
        ${
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
}: Props) {
  // 클릭 핸들러 메모이제이션
  const handleClick = useCallback(
    (subj: string) => {
      setSelected(subj);
    },
    [setSelected]
  );
  return (
    <div className="flex justify-center items-center border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
      {subjects.map((subj) => (
        <SubjectButton
          key={subj}
          subj={subj}
          isSelected={subj === selected}
          onClick={() => setSelected(subj)}
        />
      ))}
    </div>
  );
});

export default SubjectTabs;
