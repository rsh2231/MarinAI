"use client";

import ScheduleComponent from "@/components/schedule/ScheduleComponent";
import React, { useRef } from "react"; 

export default function SchedulePage() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={scrollContainerRef}
      className="bg-neutral-900 h-full overflow-auto"
    >
      {/* ScheduleComponent에 생성한 ref를 prop으로 전달합니다. */}
      <ScheduleComponent scrollableRef={scrollContainerRef} />
    </div>
  );
}