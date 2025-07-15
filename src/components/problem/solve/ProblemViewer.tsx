"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import QuestionCard from "../UI/QuestionCard";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { QnaItem, Question, SubjectGroup } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";
import ViewerCore from "../UI/ViewerCore";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
}

export default function ProblemViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
}: Props) {
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ year, license, level, round });
        const res = await fetch(`/api/solve?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`);
        }
        const responseData: { qnas: QnaItem[] } = await res.json();
        const transformed = transformData(responseData.qnas);

        if (transformed.length === 0) {
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        }
        
        setSubjectGroups(transformed);
        setAnswers({});
        setShowAnswer({});
        // selectedSubject는 filteredSubjects 기반으로 아래 useEffect에서 설정
      } catch (err: any) {
        setError(err.message);
        setSubjectGroups([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [year, license, level, round]);

  const filteredSubjects = useMemo(() => {
    if (selectedSubjects.length === 0) return [];
    return subjectGroups.filter((group) =>
      selectedSubjects.includes(group.subjectName)
    );
  }, [subjectGroups, selectedSubjects]);

  const subjectNames = useMemo(() => filteredSubjects.map((g) => g.subjectName), [filteredSubjects]);
  const selectedIndex = subjectNames.findIndex((s) => s === selectedSubject);

  useEffect(() => {
    if (subjectNames.length > 0) {
      if (!selectedSubject || !subjectNames.includes(selectedSubject)) {
        setSelectedSubject(subjectNames[0]);
      }
    } else {
      setSelectedSubject(null);
    }
  }, [subjectNames, selectedSubject]);
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  const handleSelectSubject = useCallback((subj: string) => {
    setSelectedSubject(subj);
    scrollToTop();
  }, []);

  const handleSelectAnswer = (questionId: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const toggleAnswer = (question: Question) => {
    const isNowShowing = !showAnswer[question.id];
    setShowAnswer((prev) => ({ ...prev, [question.id]: isNowShowing }));
    if (isNowShowing) {
      const selectedChoice = answers[question.id];
      if (selectedChoice && selectedChoice !== question.answer) {
        const savedNotes = loadWrongNotes();
        if (!savedNotes.find((note) => note.id === question.id.toString())) {
          saveWrongNote({
            id: question.id.toString(),
            question: question.questionStr,
            explanation: question.explanation ?? "AI 해설을 생성하여 저장하세요.",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  const selectedBlock = filteredSubjects.find(
    (g) => g.subjectName === selectedSubject
  );

  return (
    <ViewerCore
      isLoading={isLoading}
      error={error}
      filteredSubjects={filteredSubjects}
      selectedSubject={selectedSubject}
      onSelectSubject={handleSelectSubject}
      footerContent={
        <>
          <Button
            variant="neutral"
            onClick={() => handleSelectSubject(subjectNames[selectedIndex - 1])}
            disabled={selectedIndex <= 0}
            className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
          </Button>
          <Button
            onClick={() => handleSelectSubject(subjectNames[selectedIndex + 1])}
            disabled={selectedIndex >= subjectNames.length - 1}
            className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
          >
            다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </>
      }
    >
      {selectedBlock?.questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          selected={answers[q.id]}
          showAnswer={!!showAnswer[q.id]}
          onSelect={(choice) => handleSelectAnswer(q.id, choice)}
          onToggle={() => toggleAnswer(q)}
        />
      ))}
    </ViewerCore>
  );
}