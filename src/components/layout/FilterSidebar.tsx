"use client";

import React, { useCallback } from "react";
import SelectBox from "../ui/SelectBox";
import { X } from "lucide-react";
import { FilterState } from "@/types/FilterState";
import { SUBJECTS_BY_LICENSE } from "@/lib/constants";

const YEARS = ["2023", "2022", "2021"];
const LICENSES = ["항해사", "기관사", "소형선박조종사"];
const LEVELS = ["1급", "2급", "3급", "4급", "5급", "6급"];
const ROUNDS = ["1회", "2회", "3회", "4회"];

type FilterSidebarProps = FilterState & {
  sidebarOpen: boolean;
  onClose: () => void;
  className?: string;
  selectedSubjects: string[];
  setSelectedSubjects: React.Dispatch<React.SetStateAction<string[]>>;
};

interface SubjectButtonProps {
  subject: string;
  isSelected: boolean;
  onToggle: (subject: string) => void;
}

// 과목 버튼 컴포넌트 (React.memo 적용)
const SubjectButton = React.memo(function SubjectButton({
  subject,
  isSelected,
  onToggle,
}: SubjectButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(subject)}
      className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-200
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-500"
            : "bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600"
        }`}
    >
      {subject}
    </button>
  );
});

export default function FilterSidebar({
  year,
  setYear,
  license,
  setLicense,
  level,
  setLevel,
  round,
  setRound,
  selectedSubjects,
  setSelectedSubjects,
  className = "",
  sidebarOpen = false,
  onClose,
}: FilterSidebarProps) {
  const isSmallShip = license === "소형선박조종사";

  // license 변경시 과목 선택 초기화
  const handleLicenseChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = e.target.value;
      if (selected === "") {
        setLicense(null);
      } else {
        setLicense(selected as "항해사" | "기관사" | "소형선박조종사");
      }

      if (selected === "소형선박조종사") {
        setLevel("");
      } else if (!LEVELS.includes(level)) {
        setLevel(LEVELS[0]);
      }
      setSelectedSubjects([]); // 과목 선택 초기화
    },
    [level, setLevel, setLicense, setSelectedSubjects]
  );

  // 과목 선택 토글 함수 (useCallback으로 메모이제이션)
  const toggleSubject = useCallback(
    (subject: string) => {
      setSelectedSubjects((prev) =>
        prev.includes(subject)
          ? prev.filter((s) => s !== subject)
          : [...prev, subject]
      );
    },
    [setSelectedSubjects]
  );

  const subjects = license ? SUBJECTS_BY_LICENSE[license] || [] : [];

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-50 bg-[#1f2937] p-6 shadow-2xl border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:shadow-none
        flex flex-col space-y-6
        ${className}
      `}
      role="complementary"
      aria-label="문제 필터 사이드바"
    >
      {/* 모바일 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className="self-end text-gray-400 hover:text-white p-1 md:hidden"
          aria-label="사이드바 닫기"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-3">
        문제 필터
      </h2>

      <div className="space-y-4 text-sm text-gray-300">
        <SelectBox
          label="연도 선택"
          id="year-select"
          value={year ?? ""}
          onChange={(e) => setYear(e.target.value)}
          options={YEARS}
        />

        <SelectBox
          label="자격증 종류"
          id="license-select"
          value={license ?? ""}
          onChange={handleLicenseChange}
          options={LICENSES}
        />

        {!isSmallShip && (
          <SelectBox
            label="급수"
            id="level-select"
            value={level ?? ""}
            onChange={(e) => setLevel(e.target.value)}
            options={LEVELS}
          />
        )}

        <SelectBox
          label="회차"
          id="round-select"
          value={round ?? ""}
          onChange={(e) => setRound(e.target.value)}
          options={ROUNDS}
        />

        {/* 자격증별 과목 선택 영역 */}
        <div>
          <h3 className="text-white mb-2 text-sm font-semibold">과목 선택</h3>
          {license === null ? (
            <p className="text-gray-400 text-xs">먼저 자격증을 선택하세요.</p>
          ) : subjects.length === 0 ? (
            <p className="text-gray-400 text-xs">과목 정보가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {subjects.map((subject) => (
                <SubjectButton
                  key={subject}
                  subject={subject}
                  isSelected={selectedSubjects.includes(subject)}
                  onToggle={toggleSubject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
