"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, FileBarChart, PieChart } from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { href: "/mypage", label: "마이페이지 홈", icon: LayoutDashboard },
  { href: "/mypage/wrong-note", label: "오답노트", icon: BookOpen },
  { href: "/mypage/practice", label: "실전 모드 결과", icon: ClipboardList },
  { href: "/mypage/cbt", label: "CBT 결과", icon: FileBarChart },
  { href: "/mypage/performance", label: "성과 차트", icon: PieChart },
];

export default function SidebarMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 text-sm text-gray-300 w-full">
      {menuItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-gray-800 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
