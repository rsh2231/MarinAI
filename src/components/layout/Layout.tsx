"use client";

import { usePathname } from "next/navigation";
import ScrollToTopButton from "../ui/ScrollToTopButton";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className={`flex-1 ${
          isHomePage
            ? "flex flex-col items-center justify-center overflow-hidden"
            : "max-w-7xl w-full mx-auto sm:px-6 sm:py-6"
        }`}
      >
        {children}
      </main>
      {!isHomePage && <ScrollToTopButton />}
    </div>
  );
}
