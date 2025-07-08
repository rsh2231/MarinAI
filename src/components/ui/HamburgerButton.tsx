"use client";

import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebarAtom";
import { motion } from "framer-motion";
import React from "react";

type HamburgerButtonProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "white" | "black" | "gray" | "blue";
  label?: string;
};

export default function HamburgerButton({
  className,
  size = "md",
  color = "white",
  label = "사이드바 열기",
}: HamburgerButtonProps) {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const lineW = size === "lg" ? "w-8 sm:w-9" : size === "sm" ? "w-5 sm:w-6" : "w-6 sm:w-7";

  // ✅ 동적 색상 클래스 매핑
  const colorClass = {
    white: "bg-white",
    black: "bg-black",
    gray: "bg-gray-500",
    blue: "bg-blue-500",
  }[color] ?? "bg-white";

  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className={`shrink-0 flex flex-col justify-center items-center 
        ${sizeMap[size]} rounded-lg bg-black/40 hover:bg-black/60 
        transition-colors duration-200 backdrop-blur-md border border-gray-600 
        text-white shadow-md focus:outline-none focus-visible:ring-2 
        focus-visible:ring-blue-500 ${className ?? ""}`}
      aria-label={label}
      aria-expanded={sidebarOpen}
      aria-pressed={sidebarOpen}
    >
      <motion.span
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={{
          open: { rotate: 45, y: 6 },
          closed: { rotate: 0, y: -6 },
        }}
        transition={{ duration: 0.3 }}
        className={`block ${lineW} h-0.5 ${colorClass}`}
      />
      <motion.span
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 0 },
          closed: { opacity: 1 },
        }}
        transition={{ duration: 0.3 }}
        className={`block ${lineW} h-0.5 ${colorClass} my-0.5`}
      />
      <motion.span
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        variants={{
          open: { rotate: -45, y: -6 },
          closed: { rotate: 0, y: 6 },
        }}
        transition={{ duration: 0.3 }}
        className={`block ${lineW} h-0.5 ${colorClass}`}
      />
    </button>
  );
}
