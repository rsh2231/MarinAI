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
    <header className="bg-blue-700 text-white shadow px-4 py-3 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/">⚓ MarinAI</Link>
        </h1>

        <nav className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:underline ${
                pathname === item.href ? "font-bold underline" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
