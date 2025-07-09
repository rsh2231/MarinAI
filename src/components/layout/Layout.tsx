"use client";

import { usePathname } from "next/navigation";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isChatPage = pathname.startsWith("/chat");

  return (
    // ✅ 화면 전체 높이를 차지하고, 자식 요소들을 수직으로 배치합니다.
    <div className="flex flex-col h-screen">
      <Header />
      <main
        className={`h-[calc(100vh-60px)] ${
          isHomePage
            ? "flex flex-col items-center justify-center"
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