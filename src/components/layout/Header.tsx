"use client";

import { usePathname } from "next/navigation";
import HamburgerButton from "../solve/HamburgerButton";
import Link from "next/link";

const navItems = [
  { name: "기출문제풀이", href: "/solve" },
  { name: "오답노트", href: "/note" },
  { name: "CBT", href: "/cbt" },
];

export default function Header() {
  const pathname = usePathname();
  const isSolvePage = pathname === "/solve";

  return (
    <header className="bg-[#121212] sticky top-0 z-50 border-b border-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">

        {/* 왼쪽: 햄버거 + 로고 */}
        <div className="flex items-center gap-3 min-w-0">
          {isSolvePage && (
            <HamburgerButton className="md:hidden" />
          )}
          {/* 로고 */}
          <h1 className="text-lg sm:text-xl font-bold tracking-wide truncate overflow-hidden">
            <Link href="/" className="hover:text-primary whitespace-nowrap text-white">
              Marin<span className="text-blue-500">AI</span>
            </Link>
          </h1>
        </div>

        {/* 오른쪽: 네비게이션 */}
        <nav className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base mt-2 sm:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1 rounded-md font-medium transition-colors duration-200 ${isActive
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
