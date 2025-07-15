"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isChatPage = pathname.startsWith("/chat");

  const mainScrollRef = useRef<HTMLElement>(null);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <main
        ref={mainScrollRef}
        className={`flex-1 overflow-y-auto ${
          isHomePage
            ? "flex flex-col items-center justify-center"
            : isChatPage
            ? "w-full"
            : "max-w-7xl w-full mx-auto sm:px-6"
        }`}
      >
        {children}
      </main>
      
      {!isHomePage && !isChatPage && (
        <ScrollToTopButton scrollableRef={mainScrollRef} />
      )}
    </div>
  );
}
