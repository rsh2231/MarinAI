"use client";

import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebarAtom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import FilterSidebar from "../solve/FilterSidebar";
import { FilterState } from "@/types/FilterState";

type SidebarProps = {
  filterState: FilterState;
  className?: string;
};

export default function Sidebar({ filterState, className = "" }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  const handleClose = () => setSidebarOpen(false);

  return (
    <>
      {/* 데스크탑 전용 */}
      <aside
        className={`hidden md:block w-64 bg-[#1f2937] text-white border-r border-gray-700 p-6 ${className}`}
      >
        <FilterSidebar
          {...filterState}
          sidebarOpen={sidebarOpen}
          onClose={handleClose}
        />
      </aside>

      {/* 모바일 전용 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 슬라이딩 사이드바 */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className={`fixed top-0 left-0 z-40 h-full w-1/2 p-4 bg-[#1f2937] text-white border-r border-gray-700 shadow-xl md:hidden ${className}`}
            >
             
              <FilterSidebar
                {...filterState}
                sidebarOpen={sidebarOpen}
                onClose={handleClose}
              />
            </motion.aside>

            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 bg-black backdrop-blur-sm md:hidden"
              onClick={handleClose}
              aria-hidden="true"
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
