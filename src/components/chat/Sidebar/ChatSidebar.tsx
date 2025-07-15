"use client";
import React from "react";
import HistoryItem from "./HistoryItem";
import { SquarePen } from "lucide-react";
import Button from "@/components/ui/Button";

interface ChatHistoryItem {
  id: number;
  title: string;
  date: string;
}

interface GroupedHistory {
  [key: string]: ChatHistoryItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // 예시 데이터
  const chatHistory = [
    { id: 1, title: "오늘의 대화", date: "2025-07-15" },
    { id: 2, title: "어제의 아이디어", date: "2025-07-14" },
    { id: 3, title: "프로젝트 회의", date: "2025-07-14" },
    { id: 4, title: "주간 보고서 초안", date: "2025-07-11" },
  ];

  // 날짜별 그룹화
  const groupedHistory = chatHistory.reduce<GroupedHistory>((acc, item) => {
    const date = new Date(item.date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {})

  return (
    <aside
      // 기존 레이아웃을 그대로 유지합니다.
      className={`fixed top-0 bottom-0 left-0 z-30 w-64 bg-neutral-900 pt-16 p-4 transition-transform duration-200 ease-in-out
        flex flex-col overflow-y-auto h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:z-10 md:h-auto md:flex-shrink-0 border-r border-neutral-700`}
    >
      <Button
        className="px-4 py-2 rounded-lg mb-4"
        variant="neutral"
        onClick={() => {
          localStorage.removeItem("chat");
          location.href = "/chat";
        }}
      >
        <span className="flex items-center justify-center gap-2"> <SquarePen size={18} /> 새 채팅</span>
      </Button>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date}>
            {/* 날짜 제목 */}
            <h3 className="text-xs font-semibold text-neutral-500 px-3 py-1">{date}</h3>
            {/* 해당 날짜의 채팅 목록 */}
            <div className="space-y-1">
              {items.map((item) => (
                <HistoryItem key={item.id} title={item.title} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
