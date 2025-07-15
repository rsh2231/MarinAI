"use client";
import { MessageSquare, MoreHorizontal } from "lucide-react";

interface HistoryItemProps {
  title: string;
  active?: boolean;
}

export default function HistoryItem({ title, active = false }: HistoryItemProps) {
  return (
    <div
      onClick={() => alert(`${title} 불러오기`)}
      className={`group flex items-center justify-between cursor-pointer p-3 rounded-md transition-colors text-sm
        ${active
          ? "bg-neutral-700 text-white"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
        }`}
    >
      <div className="flex items-center gap-3">
        <MessageSquare size={16} className={`${active ? "text-white": "text-neutral-500"}`} />
        <span className="truncate w-36">{title}</span>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-white">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}