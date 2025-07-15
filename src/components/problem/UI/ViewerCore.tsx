// src/components/problem/ViewerCore.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SubjectGroup } from "@/types/ProblemViewer";
import SubjectTabs from "./SubjectTabs";
import { EmptyMessage } from "../../ui/EmptyMessage";

interface ViewerCoreProps {
  isLoading: boolean;
  error: string | null;
  filteredSubjects: SubjectGroup[];
  selectedSubject: string | null;
  onSelectSubject: (subjectName: string) => void;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
}

export default function ViewerCore({
  isLoading,
  error,
  filteredSubjects,
  selectedSubject,
  onSelectSubject,
  headerContent,
  footerContent,
  children,
}: ViewerCoreProps) {
  const subjectNames = filteredSubjects.map((g) => g.subjectName);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);
  const selectedBlock = filteredSubjects.find(
    (g) => g.subjectName === selectedSubject
  );

  if (isLoading) {
    return (
      <p className="text-gray-400 text-center mt-6 text-sm">
        문제를 불러오는 중입니다...
      </p>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-6 text-sm">⚠️ {error}</p>;
  }

  if (filteredSubjects.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <EmptyMessage message="선택하신 조건에 해당하는 문제가 없습니다." />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl px-2 sm:px-4 pb-10">
      {/* 모드에 따라 다른 헤더 컨텐츠 (예: 타이머)가 렌더링되는 공간 */}
      {headerContent}
      
      {/* 헤더에 가려지지 않도록 패딩 추가 */}
      <div className={headerContent ? "pt-16 sm:pt-12" : ""}>
        {subjectNames.length > 0 && selectedSubject && (
          <>
            {/* 과목 진행률 바 */}
            <div className="w-full mb-4 flex justify-center px-2">
              <div className="w-full sm:w-3/4 md:w-1/2">
                <div className="flex items-center justify-center text-gray-300 mb-1">
                  <div className="flex items-center gap-1 xs:gap-2">
                    <span className="text-base xs:text-lg">📘</span>
                    <span className="truncate">
                      {selectedIndex + 1} / {subjectNames.length} 과목
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      width: `${((selectedIndex + 1) / subjectNames.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            {/* 과목 탭 */}
            <div className="flex justify-center overflow-x-auto px-2 sm:px-6 no-scrollbar">
              <SubjectTabs
                subjects={subjectNames}
                selected={selectedSubject}
                setSelected={onSelectSubject}
              />
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {selectedBlock ? (
            <motion.section
              key={selectedBlock.subjectName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 sm:mt-8 space-y-5 sm:space-y-8"
            >
              {/* 실제 문제 카드들이 렌더링되는 부분 */}
              {children}

              {/* 모드에 따라 다른 푸터 컨텐츠 (예: 이전/다음/제출 버튼)가 렌더링되는 공간 */}
              <div className="flex flex-row justify-center items-center gap-3 mt-8">
                {footerContent}
              </div>
            </motion.section>
          ) : (
            !isLoading && (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <EmptyMessage />
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}