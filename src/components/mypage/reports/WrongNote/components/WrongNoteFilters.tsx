import { FilterOptions, WrongNoteFilters } from "../types/index";

interface WrongNoteFilterControlsProps {
  filters: FilterOptions;
  selectedValues: WrongNoteFilters;
  onFilterChange: (filterName: keyof WrongNoteFilters, value: string) => void;
}

export const WrongNoteFilterControls = ({
  filters,
  selectedValues,
  onFilterChange,
}: WrongNoteFilterControlsProps) => {
  const handleLicenseChange = (value: string) => {
    onFilterChange("license", value);
    // 자격증이 변경되면 급수와 과목 초기화
    onFilterChange("grade", "");
    onFilterChange("subject", "");
  };

  const handleGradeChange = (value: string) => {
    onFilterChange("grade", value);
    // 급수가 변경되면 과목 초기화
    onFilterChange("subject", "");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* 자격증 필터 */}
      <select
        value={selectedValues.license}
        onChange={(e) => handleLicenseChange(e.target.value)}
        className="h-9 px-3 py-1.5 text-xs bg-neutral-700 border border-neutral-600 rounded text-neutral-300 focus:outline-none focus:border-blue-500 min-w-[80px]"
      >
        <option value="">전체 자격증</option>
        {filters.licenses.map((license) => (
          <option key={license} value={license}>
            {license}
          </option>
        ))}
      </select>

      {/* 급수 필터 */}
      <select
        value={selectedValues.grade}
        onChange={(e) => handleGradeChange(e.target.value)}
        className="h-9 px-3 py-1.5 text-xs bg-neutral-700 border border-neutral-600 rounded text-neutral-300 focus:outline-none focus:border-blue-500 min-w-[80px]"
        disabled={!selectedValues.license}
      >
        <option value="">전체 급수</option>
        {filters.grades.map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>

      {/* 과목 필터 */}
      <select
        value={selectedValues.subject}
        onChange={(e) => onFilterChange("subject", e.target.value)}
        className="h-9 px-3 py-1.5 text-xs bg-neutral-700 border border-neutral-600 rounded text-neutral-300 focus:outline-none focus:border-blue-500 min-w-[80px]"
        disabled={!selectedValues.license}
      >
        <option value="">전체 과목</option>
        {filters.subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </div>
  );
};
