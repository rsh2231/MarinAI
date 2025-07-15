"use client";
import React from "react";
import ChatBox from "@/components/chat/ChatBox";
import Sidebar from "@/components/chat/Sidebar/ChatSidebar";
import { useAtom } from "jotai";
import { chatSidebarAtom } from "@/atoms/chatSidebarAtom";

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="h-screen w-full" />}>
      <ChatPageContent />
    </React.Suspense>
  );
}

function ChatPageContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(chatSidebarAtom);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Overlay for mobile when sidebar is open */}
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
