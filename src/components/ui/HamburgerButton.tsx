"use client";

import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/atoms/sidebarAtom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

type HamburgerButtonProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "white" | "black" | "gray" | "blue";
  label?: string;

  // 👉 외부 상태를 사용할 경우
  isOpen?: boolean;
  toggle?: () => void;
};

export default function HamburgerButton({
  className,
  size = "md",
  color = "white",
  label = "사이드바 열기",
  isOpen,
  toggle,
}: HamburgerButtonProps) {
  // fallback to global atom if no prop provided
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const open = isOpen ?? sidebarOpen;
  const handleToggle = toggle ?? (() => setSidebarOpen(!sidebarOpen));

  const sizeMap = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  const iconSize = sizeMap[size];
  const colorMap = {
    white: "text-white",
    black: "text-black",
    gray: "text-gray-500",
    blue: "text-blue-500",
  };
  const iconColor = colorMap[color] ?? "text-white";

  return (
    <button
      onClick={handleToggle}
      className={`
        shrink-0 rounded-lg bg-black/40 hover:bg-black/60
        transition-colors duration-200 backdrop-blur-md border border-gray-600
        shadow-md focus:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500 flex items-center justify-center
        ${className ?? ""}
      `}
      aria-label={label}
      aria-expanded={open}
      aria-pressed={open}
      style={{ width: iconSize + 12, height: iconSize + 12 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={open ? "x" : "menu"}
          initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {open ? <X size={iconSize} className={iconColor} /> : <Menu size={iconSize} className={iconColor} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
