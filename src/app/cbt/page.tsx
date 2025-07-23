"use client";

import { useState, useRef } from "react";
import CbtViewer from "@/components/cbt/CbtViewer";
import { OmrSheet } from "@/components/problem/UI/OmrSheet";
import { useAtomValue, useSetAtom } from "jotai";
import {
  isOmrVisibleAtom,
  currentQuestionIndexAtom,
  selectedSubjectAtom,
} from "@/atoms/examAtoms";
import { Question } from "@/types/ProblemViewer";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type ExamStatus = "not-started" | "in-progress" | "finished";

export default function CbtPage() {
  const [status, setStatus] = useState<ExamStatus>("not-started");
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const isOmrVisible = useAtomValue(isOmrVisibleAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);

  // 쿼리 파라미터로 세팅값 자동 적용
  const searchParams = useSearchParams();
  const [license, setLicense] = useState<string | null>(null);
  const [level, setLevel] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const licenseParam = searchParams.get("license");
    const levelParam = searchParams.get("level");
    const subjectsParam = searchParams.getAll("subjects");
    if (licenseParam) setLicense(licenseParam);
    if (levelParam) setLevel(levelParam);
    if (subjectsParam && subjectsParam.length > 0) setSubjects(subjectsParam);
    // license와 (level 또는 소형선박조종사)이 있으면 자동 시작
    if (licenseParam && (licenseParam === "소형선박조종사" || levelParam)) {
      setStatus("in-progress");
    }
  }, [searchParams]);

  const handleQuestionSelectFromOMR = (question: Question, index: number) => {
    setCurrentIdx(index);
    setSelectedSubject(question.subjectName);
  };

  return (
    <div className="w-full h-full">
      {status === "in-progress" && (
        <OmrSheet onSelectQuestion={handleQuestionSelectFromOMR} />
      )}

      <main
        ref={mainScrollRef}
        className={`bg-[#0f172a] h-full overflow-y-auto transition-all duration-300 ${
          isOmrVisible && status === "in-progress" ? "lg:mr-72" : ""
        }`}
      >
        <CbtViewer
          status={status}
          setStatus={setStatus}
          scrollRef={mainScrollRef}
        />
      </main>
    </div>
  );
}
