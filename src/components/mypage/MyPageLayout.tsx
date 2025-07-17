"use client";

import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function MyPageLayout({ children, sidebar }: Props) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-foreground-dark font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-6">
        {/* 사이드바 */}
        <aside
          aria-label="마이페이지 메뉴"
          className="w-full md:w-64 md:sticky md:top-[var(--header-height)] self-start rounded-2xl bg-secondary/20 dark:bg-secondary/30 p-5 shadow-md"
        >
          {sidebar}
        </aside>

        {/* 메인 컨텐츠 */}
        <section
          aria-label="마이페이지 콘텐츠"
          className="flex-1 rounded-2xl bg-background p-6 sm:p-8 shadow-md"
        >
          {children}
        </section>
      </div>
    </main>
  );
}
