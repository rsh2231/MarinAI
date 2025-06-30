import SelectBox from "../ui/SelectBox";
import { X } from "lucide-react";

const YEARS = ["2023", "2022", "2021"];
const LICENSES = ["항해사", "기관사", "소형선박조종사"];
const LEVELS = ["1급", "2급", "3급", "4급", "5급", "6급"];
const ROUNDS = ["1회", "2회", "3회", "4회"];

type FilterState = {
  year: string;
  setYear: (v: string) => void;
  license: string;
  setLicense: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  round: string;
  setRound: (v: string) => void;
};

type Props = FilterState & {
  className?: string;
  sidebarOpen?: boolean;
  onClose?: () => void;
};

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
      </div>
    </aside>
  );
}
