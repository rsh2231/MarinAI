"use client";

import { Suspense } from "react";
import { useState, useRef } from "react";
import CbtViewer from "@/components/cbt/CbtViewer";
import { OmrSheet } from "@/components/problem/UI/OmrSheet";
import { useAtomValue } from "jotai";
import {
  isOmrVisibleAtom,
} from "@/atoms/examAtoms";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type ExamStatus = "not-started" | "in-progress" | "finished";

export default function CbtPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CbtPageContent />
    </Suspense>
  );
}

function CbtPageContent() {
  const [status, setStatus] = useState<ExamStatus>("not-started");
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const isOmrVisible = useAtomValue(isOmrVisibleAtom);
  // 쿼리 파라미터로 세팅값 자동 적용
  const searchParams = useSearchParams();

  useEffect(() => {
    const licenseParam = searchParams.get("license");
    const levelParam = searchParams.get("level");
    // license와 (level 또는 소형선박조종사)이 있으면 자동 시작
    if (licenseParam && (licenseParam === "소형선박조종사" || levelParam)) {
      setStatus("in-progress");
    }
  }, [searchParams]);

  return (
    <div className="w-full h-full">
      {status === "in-progress" && (
        <OmrSheet />
      )}

      <main
        ref={mainScrollRef}
        className={`bg-[#0f172a] h-full transition-all duration-300 ${
          status === "finished" ? "overflow-hidden" : "overflow-y-auto"
        } ${
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
