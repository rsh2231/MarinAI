import React from "react";
import ChatBox from "./ChatBox";
import Sidebar from "./Sidebar/ChatSidebar";
import { useAtom } from "jotai";
import { chatSidebarAtom } from "@/atoms/chatSidebarAtom";

export default function ChatPageContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(chatSidebarAtom);

  // 모바일에서 사이드바 열릴 때 body 스크롤 막기
  React.useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className={`flex-1 overflow-y-auto ${isSidebarOpen ? "md:ml-64" : ""}`}>
        <ChatBox />
      </div>
    </div>
  );
} 