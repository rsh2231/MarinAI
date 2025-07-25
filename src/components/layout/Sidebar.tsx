"use client";

import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebarAtom";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "./FilterSidebar";
import { FilterState } from "@/types/FilterState";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

type SidebarProps = {
  filterState: FilterState;
  className?: string;
};

export default function Sidebar({ filterState, className = "" }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const isMobile = useIsMobile(768);

  const handleClose = () => setSidebarOpen(false);

  // body 스크롤 잠금/해제 로직
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      // 컴포넌트가 언마운트되거나 sidebarOpen이 false가 될 때 원래 스타일로 복구
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [sidebarOpen, isMobile]);

  const sidebarBaseStyles = "w-64 bg-[#1e293b] text-white border-r border-gray-700";

  return (
    <>
      {/* 데스크탑 전용 사이드바 */}
      <aside
        className={`hidden md:block ${sidebarBaseStyles} p-15 h-auto ${className}`}>
        <FilterSidebar
          {...filterState}
          sidebarOpen={false}
          onClose={() => {}}
        />
      </aside>

        {/* 모바일 전용 오버레이 및 사이드바 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* 슬라이딩 사이드바 */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`fixed top-0 left-0 z-40 h-full md:hidden ${sidebarBaseStyles} p-10 mt-15 shadow-2xl`}
            >
              <FilterSidebar
                {...filterState}
                sidebarOpen={sidebarOpen}
                onClose={handleClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}