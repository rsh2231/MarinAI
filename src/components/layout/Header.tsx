"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "GPT질문", href: "/chat" },
  { name: "기출문제풀이", href: "/solve" },
  { name: "오답노트", href: "/note" },
  { name: "CBT", href: "/cbt" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#1f2937] text-gray-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        {/* 로고/타이틀 */}
        <h1 className="text-xl font-bold tracking-wide">
          <Link href="/" className="hover:text-primary">
            Marin<span className="text-blue-500">AI</span>
          </Link>
        </h1>

        {/* 내비게이션 */}
        <nav className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-0 text-sm sm:text-base">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1 rounded-md font-medium transition-colors duration-200 ${
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
