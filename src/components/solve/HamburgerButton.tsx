"use client";

import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebarAtom";
import { motion } from "framer-motion";

type HamburgerButtonProps = {
  className?: string;
};

export default function HamburgerButton({ className }: HamburgerButtonProps) {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className={`shrink-0 flex flex-col justify-center items-center w-10 h-10 
              rounded-lg bg-black/40 hover:bg-black/60 transition-colors duration-200
              backdrop-blur-md border border-gray-600 text-white shadow-md
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${className ?? ""}`}
      aria-label="사이드바 토글"
    >
      {/* 줄 1 */}
      <motion.span
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={{
          open: { rotate: 45, y: 6 },
          closed: { rotate: 0, y: -6 },
        }}
        transition={{ duration: 0.3 }}
        className="block w-6 h-0.5 sm:w-7 sm:h-0.5 bg-white"
      />
      {/* 줄 2 */}
      <motion.span
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 0 },
          closed: { opacity: 1 },
        }}
        transition={{ duration: 0.3 }}
        className="block w-6 h-0.5 sm:w-7 sm:h-0.5 bg-white my-1"
      />
      {/* 줄 3 */}
      <motion.span
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={{
          open: { rotate: -45, y: -6 },
          closed: { rotate: 0, y: 6 },
        }}
        transition={{ duration: 0.3 }}
        className="block w-6 h-0.5 sm:w-7 sm:h-0.5 bg-white"
      />
    </button>
  );
}
