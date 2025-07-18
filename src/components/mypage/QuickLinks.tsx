"use client";
import Link from 'next/link';
import { BookOpenCheck, Edit, History } from "lucide-react";

const links = [
  { href: "/cbt", label: "CBT 모의고사", icon: <Edit size={18}/> },
  { href: "/practice", label: "기출문제 풀기", icon: <History size={18}/> },
  { href: "/wrong-note", label: "오답노트 바로가기", icon: <BookOpenCheck size={18}/> },
];

export default function QuickLinks() {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">바로가기</h3>
      <div className="flex flex-col gap-3">
        {links.map(link => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-md hover:bg-neutral-700 font-semibold transition-colors">
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}