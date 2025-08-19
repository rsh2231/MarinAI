"use client";
import React, { useEffect, useState } from "react";
import HistoryItem from "./HistoryItem";
import { SquarePen } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";

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
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [authState] = useAtom(authAtom);
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!authState.token) {
        setIsLoading(false);
        setGroupedHistory({});
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
          }
          throw new Error("채팅 기록을 불러오는데 실패했습니다.");
        }
        const chatHistory: ChatHistoryItem[] = await response.json();

        const grouped = chatHistory.reduce<GroupedHistory>((acc, item) => {
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
        }, {});
        setGroupedHistory(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [authState.token]);

  return (
    <aside
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
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center text-neutral-500">채팅 기록이 없습니다.</div>
        ) : (
          Object.entries(groupedHistory).map(([date, items]) => (
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
          ))
        )}
      </div>
    </aside>
  );
}