"use client";

import { useAtomValue } from "jotai";
import { BookCheck, Timer, List } from "lucide-react";
import SubjectTabs from "../UI/SubjectTabs";
import Button from "@/components/ui/Button";
import { selectedSubjectAtom, timeLeftAtom } from "@/atoms/examAtoms";

interface Props {
  subjectNames: string[];
  onSubjectChange: (subject: string) => void;
  onToggleOmr: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export function ExamHeader({ subjectNames, onSubjectChange, onToggleOmr }: Props) {
  const selectedSubject = useAtomValue(selectedSubjectAtom);
  const timeLeft = useAtomValue(timeLeftAtom);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  if (!selectedSubject) return null;

  return (
    <header className="sticky top-0 z-30 bg-[#1e293b]/90 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 pt-3 pb-2">
          <div className="flex items-center gap-3 text-gray-200">
            <BookCheck className="w-5 h-5 text-blue-400" />
            <p className="font-bold text-base truncate">
              {selectedSubject.replace(/^\d+\.\s*/, "")}
              <span className="text-gray-400 font-normal ml-2">
                ({selectedIndex + 1}/{subjectNames.length})
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono text-base sm:text-lg font-bold ${ timeLeft < 300 ? "text-red-400 animate-pulse" : "text-blue-300" }`}>
              <Timer className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <Button variant="neutral" size="sm" onClick={onToggleOmr} className="lg:hidden">
              <List className="w-4 h-4 mr-1.5" />
              답안지
            </Button>
          </div>
        </div>
        {subjectNames.length > 0 && (
            <SubjectTabs
              subjects={subjectNames}
              selected={selectedSubject}
              setSelected={onSubjectChange}
              variant="header"
            />
        )}
      </div>
    </header>
  );
}