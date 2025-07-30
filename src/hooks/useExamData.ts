import { useEffect, useState, useMemo, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import {
  examLoadingAtom,
  examErrorAtom,
  timeLeftAtom,
  selectedSubjectAtom,
  groupedQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  showResultAtom,
} from "@/atoms/examAtoms";
import { transformData } from "@/lib/problem-utils";
import { fetchExamQuestions } from "@/lib/examApi";

const DURATION_PER_SUBJECT_SECONDS = 25 * 60;

interface UseExamDataParams {
  year: string;
  license: string;
  level: string;
  round: string;
  selectedSubjects: string[];
  retryCount?: number; 
}

export function useExamData({
  year,
  license,
  level,
  round,
  selectedSubjects,
}: UseExamDataParams) {
  const setGroupedQuestions = useSetAtom(groupedQuestionsAtom);
  const setIsLoading = useSetAtom(examLoadingAtom);
  const setError = useSetAtom(examErrorAtom);
  const setAnswers = useSetAtom(answersAtom);
  const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
  const setSelectedSubject = useSetAtom(selectedSubjectAtom);
  const setShowResult = useSetAtom(showResultAtom);
  const setTimeLeft = useSetAtom(timeLeftAtom);
  const { token, isLoggedIn } = useAtomValue(authAtom);

  const [odapsetId, setOdapsetId] = useState<number | null>(null);
  const isFetching = useRef(false);

  const totalDuration = useMemo(
    () => selectedSubjects.length * DURATION_PER_SUBJECT_SECONDS,
    [selectedSubjects.length]
  );

  useEffect(() => {
    // 선택된 과목이 없으면 초기화하고 종료
    if (selectedSubjects.length === 0) {
      setGroupedQuestions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      setIsLoading(true);
      setError(null);
      setShowResult(false);

      try {
        const params = new URLSearchParams({
          year,
          license,
          level,
          round,
        });
        const userType = isLoggedIn && token ? "로그인" : "비로그인";
        const responseData = await fetchExamQuestions({
          year,
          license,
          level,
          round,
          token: isLoggedIn ? token ?? undefined : undefined,
        });
        setOdapsetId(responseData.odapset_id ?? null);
        const allSubjectGroups = transformData(responseData.qnas);
        const filteredGroups = allSubjectGroups.filter((group) =>
          selectedSubjects.includes(group.subjectName)
        );
        if (filteredGroups.length === 0) {
          throw new Error(
            "선택하신 과목에 해당하는 문제가 없습니다. 과목을 다시 선택해주세요."
          );
        }
        // 상태 초기화
        setGroupedQuestions(filteredGroups);
        setAnswers({});
        setCurrentIdx(0);
        setSelectedSubject(filteredGroups[0].subjectName);
        setTimeLeft(totalDuration);
      } catch (err: unknown) {
        setError((err as Error).message);
        setGroupedQuestions([]);
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };

    loadData();
    // selectedSubjects 배열의 참조가 아닌 내용이 바뀔 때만 실행되도록 join 사용
  }, [
    year,
    license,
    level,
    round,
    selectedSubjects.join(","),
    token,
    isLoggedIn,
    totalDuration,
  ]);

  return { odapsetId, totalDuration };
}
