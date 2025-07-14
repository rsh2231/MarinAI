import { useEffect, useState } from "react";
import { Schedule } from "@/types/Schedule"; // 실제 경로에 맞게 수정해주세요.

/**
 * 해기사 시험 일정 데이터를 비동기적으로 가져오고 상태를 관리하는 커스텀 훅
 */
export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/schedule");
        if (!res.ok) {
          const errorData = await res.json().catch(() => null); // 에러 응답 본문 파싱 시도
          throw new Error(errorData?.message || `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`);
        }
        
        const data: Schedule[] = await res.json();
        
        if (data.length === 0) {
          // 데이터는 성공적으로 받았으나 내용이 없는 경우
          setError("조회된 시험 일정이 없습니다.");
        }
        
        setSchedules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
        setSchedules([]); // 에러 발생 시 데이터 초기화
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []); // 컴포넌트 마운트 시 1회 실행

  return { schedules, isLoading, error };
}