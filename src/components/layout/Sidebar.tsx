"use client";

import FilterSidebar from "@/components/solve/FilterSidebar";
import { FilterState } from "@/types/FilterState";
import { X } from "lucide-react";
import { useEffect } from "react";

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
  // ✨ Escape 키로 닫기 기능 (접근성 강화)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, onClose]);

  return (
    <>
      <aside
        role="complementary"
        aria-label="문제 필터 사이드바"
        className={`
          fixed top-0 left-0 z-40 h-full w-72 bg-[#1f2937] border-r border-gray-700 p-6
          shadow-lg transform transition-transform duration-300 ease-in-out
          will-change-transform
          md:relative md:translate-x-0 md:shadow-none md:border-none md:h-auto md:w-64 md:p-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${className}
        `}
      >
        {/* 모바일 전용 닫기 버튼 */}
        <button
          onClick={onClose}
          className="md:hidden mb-6 p-2 rounded-md bg-[#273449] hover:bg-[#324264] focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="사이드바 닫기"
        >
          <X className="w-6 h-6 text-blue-400" />
        </button>

        <FilterSidebar
          {...filterState}
          sidebarOpen={sidebarOpen}
          onClose={onClose}
        />
      </aside>

      {/* 오버레이 - 모바일 전용 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
