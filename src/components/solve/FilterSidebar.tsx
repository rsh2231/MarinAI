"use client";

type Props = {
  year: string;
  setYear: (v: string) => void;
  license: string;
  setLicense: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  round: string;
  setRound: (v: string) => void;
  className?: string;
  sidebarOpen?: boolean;
  onClose?: () => void;
};

const YEARS = ["2023", "2022", "2021"];
const LICENSES = ["항해사", "기관사", "소형선박조종사"];
const LEVELS = ["1급", "2급", "3급", "4급", "5급", "6급"];
const ROUNDS = ["1회", "2회", "3회", "4회"];

type SelectBoxProps = {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

const SelectBox = ({ label, id, value, onChange, options }: SelectBoxProps) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-2 font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default function FilterSidebar({
  year,
  setYear,
  license,
  setLicense,
  level,
  setLevel,
  round,
  setRound,
  className = "",
  sidebarOpen,
  onClose,
}: Props) {
  const isSmallShip = license === "소형선박조종사";

  const handleLicenseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setLicense(selected);
    if (selected === "소형선박조종사") {
      setLevel("");
    } else if (!LEVELS.includes(level)) {
      setLevel(LEVELS[0]);
    }
  };

  return (
    <aside className={`bg-white ${className}`}>
      {/* 닫기 버튼 (모바일에서만 표시) */}
      {onClose && (
        <button
          onClick={onClose}
          className="mb-6 p-2 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 md:hidden"
          aria-label="사이드바 닫기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <h2 className="text-xl font-semibold mb-6 text-gray-800">문제 필터</h2>

      <SelectBox
        label="연도"
        id="year-select"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        options={YEARS}
      />

      <SelectBox
        label="자격증 종류"
        id="license-select"
        value={license}
        onChange={handleLicenseChange}
        options={LICENSES}
      />

      {!isSmallShip && (
        <SelectBox
          label="급수"
          id="level-select"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          options={LEVELS}
        />
      )}

      <SelectBox
        label="회차"
        id="round-select"
        value={round}
        onChange={(e) => setRound(e.target.value)}
        options={ROUNDS}
      />
    </aside>
  );
}
