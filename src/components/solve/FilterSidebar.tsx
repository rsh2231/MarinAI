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
    <label htmlFor={id} className="block mb-2 font-semibold text-gray-700">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
  sidebarOpen = false,
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
    <>
      {/* 모바일용 오버레이 백그라운드 */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* 사이드바 컨테이너 */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl p-6
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shadow-none md:w-72
          flex flex-col
          ${className}`}
        role="complementary"
        aria-label="문제 필터 사이드바"
      >
        {/* 닫기 버튼 - 모바일 전용 */}
        {onClose && (
          <button
            onClick={onClose}
            className="self-end mb-6 p-2 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
            aria-label="사이드바 닫기"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b border-gray-200 pb-2">
          문제 필터
        </h2>

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
    </>
  );
}
