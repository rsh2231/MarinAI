"use client"; // 데이터를 fetch하고 상태를 관리하기 위해 클라이언트 컴포넌트로 변경

import { useState, useEffect } from "react";

interface Schedule {
  round: string;
  reception: string;
  examDate: string;
  announcement: string;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("/api/schedule");
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        const data = await res.json();
        setSchedules(data);

        console.log("data", data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div className="p-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">해기사 시험 일정</h1>
        <p className="text-sm text-gray-400 mt-1">
          정보 출처: 한국해양수산연수원 국가자격시험
        </p>
      </div>

      {isLoading && <p className="text-center">로딩 중...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="bg-neutral-800 rounded-lg p-4 shadow-md"
            >
              <h2 className="text-lg font-semibold text-primary">
                {schedule.round}
              </h2>
              <ul className="mt-2 text-sm text-neutral-300 space-y-1">
                <li>
                  <strong>원서접수:</strong> {schedule.reception}
                </li>
                <li>
                  <strong>시험일:</strong> {schedule.examDate}
                </li>
                <li>
                  <strong>합격발표:</strong> {schedule.announcement}
                </li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
