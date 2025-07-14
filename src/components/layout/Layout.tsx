"use client";

import { usePathname } from "next/navigation";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isChatPage = pathname.startsWith("/chat");

  return (
    // ✅ 화면 전체를 Flexbox 컨테이너로 설정 (수직 방향)
    <div className="flex flex-col h-screen">
      <Header />

      <main
        className={`flex-1 overflow-y-auto ${
          isHomePage
            ? "flex flex-col items-center justify-center"
            : isChatPage 
            ? "w-full" // 채팅 페이지는 너비를 꽉 채우도록
            : "max-w-7xl w-full mx-auto sm:px-6"
        }`}
      >
        {children}
      </main>
      
      {/* ScrollToTopButton은 채팅 페이지가 아닐 때만 보이도록 수정 */}
      {!isHomePage && !isChatPage && <ScrollToTopButton />}
    </div>
  );
}