"use client";

import { usePathname } from "next/navigation";
import HamburgerButton from "../ui/HamburgerButton";
import Link from "next/link";

const navItems = [
  { name: "기출문제풀이", href: "/solve" },
  { name: "오답노트", href: "/note" },
  { name: "CBT", href: "/cbt" },
];

export default function Header() {
  const pathname = usePathname();
  const isSolvePage = pathname === "/solve";

  // 클릭 시 부드럽게 최상단으로 스크롤 이동 함수
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="bg-[#121212] sticky top-0 z-50 border-b border-gray-300 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-4 py-3 gap-2">
        {/* 왼쪽: 햄버거 + 로고 */}
        <div className="flex items-center gap-3 min-w-0">
          {isSolvePage && <HamburgerButton className="sm:hidden" />}
          <h1 className="text-lg sm:text-xl font-bold tracking-wide truncate whitespace-nowrap">
            <Link
              href="/"
              onClick={handleScrollTop}
              className="hover:text-primary text-white"
            >
              Marin<span className="text-blue-500">AI</span>
            </Link>
          </h1>
        </div>

        {/* 오른쪽: 네비게이션 */}
        <nav className="flex items-center gap-1 sm:gap-3 text-sm sm:text-base overflow-x-auto whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleScrollTop}
                className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors duration-200 ${
                  isActive
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
