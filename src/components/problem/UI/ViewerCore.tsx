"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SubjectGroup } from "@/types/ProblemViewer";
import { EmptyMessage } from "../../ui/EmptyMessage";

interface ViewerCoreProps {
  isLoading: boolean;
  error: string | null;
  filteredSubjects: SubjectGroup[];
  selectedSubject: string | null;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
}

export default function ViewerCore({
  isLoading,
  error,
  filteredSubjects,
  selectedSubject,
  headerContent,
  footerContent,
  children,
}: ViewerCoreProps) {
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
    <div className="flex flex-col w-full">
      {/* 상태 바와 같은 헤더 컨텐츠가 렌더링되는 공간 */}
      {headerContent}

      {/* 실제 문제 콘텐츠 영역 */}
      <main className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-10">
        <AnimatePresence mode="wait">
          {selectedBlock ? (
            <motion.section
              key={selectedBlock.subjectName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-5 sm:space-y-8"
            >
              {/* 자식 컴포넌트(문제카드, SubjectTabs 등)가 여기에 렌더링됩니다. */}
              {children}

              {/* 이전/다음 버튼과 같은 푸터 컨텐츠가 렌더링되는 공간 */}
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
      </main>
    </div>
  );
}
