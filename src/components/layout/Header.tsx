"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "홈", href: "/" },
  { name: "GPT질문", href: "/chat" },
  { name: "문제풀이", href: "/solve" },
  { name: "오답노트", href: "/note" },
  { name: "CBT", href: "/cbt" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-blue-700 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        {/* 로고/타이틀 */}
        <h1 className="text-xl font-bold tracking-wide">
          <Link href="/" className="hover:text-sky-200">
            ⚓ MarinAI
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
                className={`px-3 py-1 rounded transition-all duration-150 ${
                  isActive
                    ? "bg-white text-blue-700 font-semibold"
                    : "hover:bg-blue-600 hover:text-white text-gray-100"
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
