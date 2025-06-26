import FilterSidebar from "@/components/solve/FilterSidebar";

type SidebarProps = {
  sidebarOpen: boolean;
  onClose: () => void;

  year: string;
  setYear: (v: string) => void;
  license: string;
  setLicense: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  round: string;
  setRound: (v: string) => void;
};

export default function Sidebar({
  sidebarOpen,
  onClose,
  year,
  setYear,
  license,
  setLicense,
  level,
  setLevel,
  round,
  setRound,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-md border-r border-gray-200 p-6
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:h-auto md:w-64 md:shadow-none md:border-none md:p-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 닫기 버튼 (모바일 전용) */}
        <button
          onClick={onClose}
          className="md:hidden mb-4 p-2 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="사이드바 닫기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <FilterSidebar
          year={year}
          setYear={setYear}
          license={license}
          setLicense={setLicense}
          level={level}
          setLevel={setLevel}
          round={round}
          setRound={setRound}
          className=""
        />
      </aside>

      {/* 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
