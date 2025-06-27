import FilterSidebar from "@/components/solve/FilterSidebar";

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

type SidebarProps = {
  sidebarOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  className?: string;
};

export default function Sidebar({
  sidebarOpen,
  onClose,
  filterState,
  className = "",
}: SidebarProps) {
  return (
    <>
      <aside
        role="complementary"
        aria-label="문제 필터 사이드바"
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-[#1f2937] shadow-lg border-r border-gray-700 p-6
          transform transition-transform duration-300 ease-in-out will-change-transform
          md:relative md:translate-x-0 md:h-auto md:w-64 md:shadow-none md:border-none md:p-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${className}
        `}
      >
        {/* 닫기 버튼 (모바일 전용) */}
        <button
          onClick={onClose}
          className="md:hidden mb-4 p-2 rounded-md bg-[#273449] hover:bg-[#324264] focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="사이드바 닫기"
        >
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <FilterSidebar
          {...filterState}
          sidebarOpen={sidebarOpen}
          onClose={onClose}
        />
      </aside>

      {/* 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
