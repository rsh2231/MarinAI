import { useEffect, useState, useRef } from "react";
import { QnaItem, SubjectGroup } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";

interface UsePracticeQuestionsParams {
  year: string;
  license: string;
  level: string;
  round: string;
  auth: { token?: string; isLoggedIn?: boolean };
}

export function usePracticeQuestions({
  year,
  license,
  level,
  round,
  auth,
}: UsePracticeQuestionsParams) {
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [odapsetId, setOdapsetId] = useState<number | null>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          examtype: "practice",
          year,
          license,
          level,
          round,
        });
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        const userType = auth.token && auth.isLoggedIn ? "로그인" : "비로그인";
        if (auth.token && auth.isLoggedIn) {
          headers.Authorization = `Bearer ${auth.token}`;
        }
        // eslint-disable-next-line no-console
        console.log(`[문제 fetch][practice][${userType}]`, params.toString());
        const res = await fetch(`/api/solve?${params.toString()}`, {
          method: "GET",
          headers,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message ||
              `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`
          );
        }
        const responseData: { qnas: QnaItem[]; odapset_id?: number } =
          await res.json();
        // eslint-disable-next-line no-console
        console.log(`[문제 fetch][practice][응답]`, responseData);
        if (responseData.odapset_id) {
          setOdapsetId(responseData.odapset_id);
        } else {
          setOdapsetId(null);
        }
        const transformed = transformData(responseData.qnas);
        if (transformed.length === 0) {
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        }
        setSubjectGroups(transformed);
      } catch (err: unknown) {
        setError((err as Error).message);
        setSubjectGroups([]);
        setOdapsetId(null);
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, license, level, round, auth.token, auth.isLoggedIn]);

  return {
    subjectGroups,
    setSubjectGroups,
    isLoading,
    error,
    odapsetId,
  };
} 