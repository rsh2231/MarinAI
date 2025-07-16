"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";

import { useIsClient } from "@/hooks/useIsClient";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { authAtom } from "@/atoms/authAtom";
import { chatSidebarAtom } from "@/atoms/chatSidebarAtom"; // chatSidebarAtom import
import MobileMenu from "./MobileMenu";
import AuthModal from "../auth/AutModal";
import HamburgerButton from "../ui/HamburgerButton";
import { List, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const isSolvePage = pathname === "/solve";
  const isChatPage = pathname === "/chat"; // /chat 페이지인지 확인
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isClient = useIsClient();
  const isMobile = useWindowWidth(768);
  const [auth, setAuth] = useAtom(authAtom);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useAtom(chatSidebarAtom); // chatSidebarAtom 사용

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    setAuth({ isLoggedIn: false, user: null });
  };

  const toggleChatSidebar = () => {
    setIsChatSidebarOpen(!isChatSidebarOpen);
  };

  const navItems = [
    { name: "Q&A", href: "/chat" },
    { name: "기출문제풀이", href: "/solve" },
    { name: "오답노트", href: "/note" },
    { name: "CBT", href: "/cbt" },
    { name: "시험일정", href: "/schedule" },
  ];

  return (
    <header className="bg-[#121212] sticky top-0 z-50 border-b border-gray-700 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 py-3 gap-2">
        {/* 왼쪽: 햄버거 + 로고 */}
        <div className="flex items-center gap-3 min-w-0">
          {isChatPage && isMobile && (
            <HamburgerButton
              isOpen={isChatSidebarOpen}
              toggle={toggleChatSidebar}
              size="sm" />
          )}
          {isSolvePage && <HamburgerButton className="md:hidden" size="sm" />}
          <h1 className="text-lg sm:text-xl font-bold tracking-wide truncate whitespace-nowrap">
            <Link
              href="/"
              onClick={handleScrollTop}
              className="flex gap-2 hover:text-primary text-white"
            >
              <span className="text-xl font-bold text-white hover:animate-pulse">
                Marin<span className="text-blue-500">AI</span>
              </span>
            </Link>
          </h1>
        </div>

        {/* 네비게이션 (PC) */}
        {isClient && !isMobile && (
          <nav className="flex items-center gap-1 sm:gap-3 text-sm sm:text-base">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleScrollTop}
                  className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors duration-200 ${isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* 로그인/로그아웃 버튼 */}
            <button
              onClick={auth.isLoggedIn ? handleLogout : () => setIsAuthModalOpen(true)}
              className="px-2 sm:px-3 py-1 rounded-md font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {auth.isLoggedIn ? "로그아웃" : "로그인"}
            </button>
          </nav>
        )}

        {/* 모바일 햄버거 버튼 (기존 모바일 메뉴용) */}
        {isClient && isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="w-8 h-8 flex items-center justify-center bg-black/40 border border-gray-600 rounded-lg"
            aria-label="모바일 메뉴 토글"
          >
            {isMobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        )}
      </div>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isClient && isMobile && isMobileMenuOpen && (
          <MobileMenu
            navItems={navItems}
            pathname={pathname}
            onClose={() => setIsMobileMenuOpen(false)}
            isLoggedIn={auth.isLoggedIn}
            onLoginClick={() => setIsAuthModalOpen(true)}
            onLogoutClick={handleLogout}
          />
        )}
      </AnimatePresence>

      {/* 로그인/회원가입 모달 */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
