"use client";

import { useMemo, useCallback, useState } from "react";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import ViewerCore from "../UI/ViewerCore";
import SubjectTabsSection from "./SubjectTabsSection";
import QuestionList from "./QuestionList";
import NavigationButtons from "./NavigationButtons";
import { usePracticeQuestions } from "../../../hooks/usePracticeQuestions";
import { useAnswerState } from "../../../hooks/useAnswerState";
import { SubjectGroup } from "@/types/ProblemViewer";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
}

export default function PracticeViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
}: Props) {
  // 인증 상태와 토큰 가져오기
  const auth = useAtomValue(authAtom);

  // 문제 데이터 패칭 및 상태 관리
  const {
    subjectGroups,
    isLoading,
    error,
    odapsetId,
  } = usePracticeQuestions({
    year,
    license,
    level,
    round,
    auth: {
      token: auth.token ?? undefined,
      isLoggedIn: auth.isLoggedIn,
    },
  });

  // 답안/정답 상태 및 저장 로직
  const {
    answers,
    showAnswer,
    handleSelectAnswer,
    toggleAnswer,
  } = useAnswerState({
    subjectGroups,
    odapsetId,
    auth: {
      token: auth.token ?? undefined,
      isLoggedIn: auth.isLoggedIn,
    },
  });

  // 과목 필터링
  const filteredSubjects = useMemo(() => {
    if (selectedSubjects.length === 0) return [];
    return subjectGroups.filter((group: SubjectGroup) =>
      selectedSubjects.includes(group.subjectName)
    );
  }, [subjectGroups, selectedSubjects]);

  const subjectNames = useMemo(
    () => filteredSubjects.map((g) => g.subjectName),
    [filteredSubjects]
  );
  // 선택된 과목 상태
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    subjectNames[0] || null
  );
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  // subjectNames가 바뀌면 selectedSubject도 동기화
  if (
    subjectNames.length > 0 &&
    (!selectedSubject || !subjectNames.includes(selectedSubject))
  ) {
    setSelectedSubject(subjectNames[0]);
  }
  if (subjectNames.length === 0 && selectedSubject) {
    setSelectedSubject(null);
  }

  // 과목 선택 핸들러
  const handleSelectSubject = useCallback((subj: string) => {
    setSelectedSubject(subj);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const selectedBlock = filteredSubjects.find(
    (g) => g.subjectName === selectedSubject
  );

  return (
    <ViewerCore
      isLoading={isLoading}
      error={error}
      filteredSubjects={filteredSubjects}
      selectedSubject={selectedSubject}
      footerContent={
        <NavigationButtons
          subjectNames={subjectNames}
          selectedIndex={selectedIndex}
          onSelect={handleSelectSubject}
        />
      }
    >
      <SubjectTabsSection
        subjects={subjectNames}
        selected={selectedSubject}
        onSelect={handleSelectSubject}
      />
      {selectedBlock && (
        <QuestionList
          questions={selectedBlock.questions}
          answers={answers}
          showAnswer={showAnswer}
          onSelect={handleSelectAnswer}
          onToggle={toggleAnswer}
        />
      )}
    </ViewerCore>
  );
}
