"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAtomValue } from "jotai";
import QuestionCard from "../UI/QuestionCard";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { saveUserAnswer } from "@/lib/wrongNoteApi";
import { QnaItem, Question, SubjectGroup } from "@/types/ProblemViewer";
import { transformData } from "@/lib/problem-utils";
import ViewerCore from "../UI/ViewerCore";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubjectTabs from "../UI/SubjectTabs";
import { authAtom } from "@/atoms/authAtom";

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
  
  // 인증 상태와 토큰 가져오기
  const auth = useAtomValue(authAtom);
  const token = auth.token;
  
  // 디바운싱을 위한 타이머 ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 시험 세트 ID (실제로는 시험 시작 시 고유 ID 생성 필요)
  const odapsetId = useMemo(() => {
    // 현재 시험 조건을 기반으로 고유한 세트 ID 생성
    return Date.now(); // 임시로 타임스탬프 사용
  }, [year, license, level, round]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ 
          examtype: 'practice', // 연습 모드
          year, 
          license, 
          level, 
          round 
        });
        // 인증 헤더 추가 (선택적)
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        
        // 로그인한 사용자만 인증 헤더 추가
        if (auth.token && auth.isLoggedIn) {
          headers.Authorization = `Bearer ${auth.token}`;
          console.log("로그인한 사용자로 연습 시작");
        } else {
          console.log("비로그인 사용자로 연습 시작");
        }
        
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
        const responseData: { qnas: QnaItem[] } = await res.json();

        console.log("Res" ,responseData)
        const transformed = transformData(responseData.qnas);

        if (transformed.length === 0) {
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        }

        setSubjectGroups(transformed);
        setAnswers({});
        setShowAnswer({});
      } catch (err: any) {
        setError(err.message);
        setSubjectGroups([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [year, license, level, round]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const filteredSubjects = useMemo(() => {
    if (selectedSubjects.length === 0) return [];
    return subjectGroups.filter((group) =>
      selectedSubjects.includes(group.subjectName)
    );
  }, [subjectGroups, selectedSubjects]);

  const subjectNames = useMemo(
    () => filteredSubjects.map((g) => g.subjectName),
    [filteredSubjects]
  );
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  const handleSelectSubject = useCallback((subj: string) => {
    setSelectedSubject(subj);
    scrollToTop();
  }, []);

  // 디바운싱된 답안 저장 함수
  const debouncedSaveAnswer = useCallback(async (questionId: number, choice: string) => {
    // 로그인한 사용자만 서버에 저장
    if (auth.token && auth.isLoggedIn) {
      try {
        await saveUserAnswer(questionId, choice, odapsetId, auth.token);
        console.log('답안이 서버에 저장되었습니다.');
      } catch (error) {
        console.error('서버 저장 실패:', error);
        // 서버 저장 실패 시에도 로컬 저장은 계속 진행
      }
    } else {
      console.log('비로그인 사용자: 답안이 로컬에만 저장됩니다.');
    }
  }, [auth.token, auth.isLoggedIn, odapsetId]);

  const handleSelectAnswer = useCallback((questionId: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
    
    // 이전 타이머가 있다면 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // 1초 후에 서버에 저장 (디바운싱)
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSaveAnswer(questionId, choice);
    }, 1000);
  }, [debouncedSaveAnswer]);

  const toggleAnswer = (question: Question) => {
    const isNowShowing = !showAnswer[question.id];
    setShowAnswer((prev) => ({ ...prev, [question.id]: isNowShowing }));
    if (isNowShowing) {
      const selectedChoice = answers[question.id];
      if (selectedChoice && selectedChoice !== question.answer) {
        const savedNotes = loadWrongNotes();
        if (
          !savedNotes.find(
            (note) => note.id.toString() === question.id.toString()
          )
        ) {
          saveWrongNote({
            id: question.id.toString(),
            question: question.questionStr,
            explanation:
              question.explanation ?? "AI 해설을 생성하여 저장하세요.",
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
      footerContent={
        <>
          <Button
            variant="neutral"
            onClick={() => handleSelectSubject(subjectNames[selectedIndex - 1])}
            disabled={selectedIndex <= 0}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
          </Button>
          <Button
            onClick={() => handleSelectSubject(subjectNames[selectedIndex + 1])}
            disabled={selectedIndex >= subjectNames.length - 1}
            className="w-full sm:w-auto"
          >
            다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </>
      }
    >
      {subjectNames.length > 0 && selectedSubject && (
        <div className="mb-6">
          <SubjectTabs
            subjects={subjectNames}
            selected={selectedSubject}
            setSelected={handleSelectSubject}
          />
        </div>
      )}

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
