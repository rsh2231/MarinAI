"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SubjectTabs from "./SubjectTabs";
import QuestionCard from "./QuestionCard";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { QnaItem, Question, Choice, SubjectGroup } from "@/types/ProblemViewer";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyMessage } from "../ui/EmptyMessage";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
}

// API 응답을 프론트엔드용 데이터 구조로 변환하는 함수
const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
  if (!qnas || qnas.length === 0) return [];

  const subjectMap = new Map<string, Question[]>();
  // @pic으로 시작하는 단어를 찾는 정규식
  const imageCodeRegex = /(@pic[\w_-]+)/;

  const findImagePath = (code: string, paths: string[]): string | undefined => {
    // 이미 @를 포함하고 있으므로 @를 제거할 필요 없음
    const key = code.replace("@", "").trim().toLowerCase();
    return paths.find((p) => p.includes(key));
  };

  qnas.forEach((item) => {
    let questionStr = item.questionstr;
    let questionImagePath: string | undefined;

    // ✅ [수정된 로직] 문제 텍스트에서 이미지 코드를 찾습니다.
    const questionImageMatch = item.questionstr.match(imageCodeRegex);

    if (questionImageMatch && item.imgPaths) {
      // ex) questionImageMatch[0]는 "@pic1308"
      const code = questionImageMatch[0];
      // 찾은 이미지 코드를 사용해 경로를 찾습니다.
      const foundPath = findImagePath(code, item.imgPaths);

      if (foundPath) {
        questionImagePath = foundPath;
        // 원본 문제 텍스트에서 이미지 코드를 제거합니다.
        questionStr = questionStr.replace(code, "").trim();
      }
    }

    const choices: Choice[] = [
      { label: "가", text: item.ex1str },
      { label: "나", text: item.ex2str },
      { label: "사", text: item.ex3str },
      { label: "아", text: item.ex4str },
    ].map((choice) => {
      // ✅ [수정된 로직] 선택지에서도 정규식을 사용해 이미지 코드를 찾습니다.
      const choiceImageMatch = choice.text.match(imageCodeRegex);
      let choiceText = choice.text;
      let choiceImagePath: string | undefined;

      if (choiceImageMatch && item.imgPaths) {
        const code = choiceImageMatch[0];
        const foundPath = findImagePath(code, item.imgPaths);
        if (foundPath) {
          choiceImagePath = foundPath;
          // 선택지에서는 이미지 코드를 포함한 텍스트를 모두 제거합니다.
          choiceText = "";
        }
      }

      // isImage는 이제 choiceImagePath가 있는지 여부로 판단합니다.
      const isImg = !!choiceImagePath;

      return {
        ...choice,
        isImage: isImg,
        text: choiceText,
        // 이전에 수정하신 대로 encodeURIComponent는 제거합니다.
        imageUrl: choiceImagePath
          ? `/api/solve/img/${choiceImagePath}`
          : undefined,
      };
    });

    const question: Question = {
      id: item.id,
      num: item.qnum,
      questionStr: questionStr, // 정제된 텍스트
      choices,
      answer: item.answer,
      explanation: item.explanation,
      subjectName: item.subject,
      isImageQuestion: !!item.imgPaths,
      imageUrl: questionImagePath
        ? `/api/solve/img/${questionImagePath}`
        : undefined, // 정제된 이미지 경로
    };

    if (!subjectMap.has(item.subject)) {
      subjectMap.set(item.subject, []);
    }
    subjectMap.get(item.subject)!.push(question);
  });

  return Array.from(subjectMap.entries()).map(([subjectName, questions]) => ({
    subjectName,
    questions,
  }));
};
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
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ year, license, level, round });
        const res = await fetch(`/api/solve?${params.toString()}`);

        

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message ||
              `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`
          );
        }

        const responseData: { qnas: QnaItem[] } = await res.json();
        const transformed = transformData(responseData.qnas);

        console.log(responseData)

        // ✅ 데이터가 없을 경우에 대한 처리
        if (transformed.length === 0) {
          // 404 Not Found의 경우, 백엔드 메시지를 활용할 수 있습니다.
          setError("선택하신 조건에 해당하는 문제 데이터가 없습니다.");
        }

        console.log("data", responseData.qnas);

        setSubjectGroups(transformed);
        setAnswers({});
        setShowAnswer({});
        setSelectedSubject(null);
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
    // 선택된 과목이 없으면 빈 배열 반환
    if (selectedSubjects.length === 0) return [];
    return subjectGroups.filter((group) =>
      selectedSubjects.includes(group.subjectName)
    );
  }, [subjectGroups, selectedSubjects]);

  const filteredSubjectNames = useMemo(() => {
    return filteredSubjects.map((group) => group.subjectName);
  }, [filteredSubjects]);

  useEffect(() => {
    if (filteredSubjectNames.length > 0) {
      if (!selectedSubject || !filteredSubjectNames.includes(selectedSubject)) {
        setSelectedSubject(filteredSubjectNames[0]);
      }
    } else {
      setSelectedSubject(null);
    }
  }, [filteredSubjectNames, selectedSubject]);

  const onSelectSubject = useCallback((subj: string) => {
    setSelectedSubject(subj);
  }, []);

  const selectedBlock = filteredSubjects.find(
    (group) => group.subjectName === selectedSubject
  );
  const selectedIndex = filteredSubjectNames.findIndex(
    (s) => s === selectedSubject
  );

  const handleSelect = (questionId: number, choice: string) => {
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
            id: question.id.toString(), // 고유 ID 사용
            question: question.questionStr,
            explanation:
              question.explanation ?? "AI 해설을 생성하여 저장하세요.",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  if (isLoading) {
    return (
      <p className="text-gray-400 text-center mt-6 text-sm">
        문제를 불러오는 중입니다...
      </p>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-6 text-sm">⚠️ {error}</p>;
  }

  if (filteredSubjects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <EmptyMessage />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl px-2 sm:px-4 pb-10">
      {filteredSubjects.length > 0 && (
        <>
          <div className="w-full mb-4 flex justify-center px-2">
            <div className="w-full sm:w-3/4 md:w-1/2">
              <div className="flex items-center justify-center text-gray-300 mb-1">
                <div className="flex items-center gap-1 xs:gap-2">
                  <span className="text-base xs:text-lg">📘</span>
                  <span className="truncate">
                    {selectedIndex + 1} / {filteredSubjectNames.length} 과목
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${
                      filteredSubjectNames.length > 0
                        ? ((selectedIndex + 1) / filteredSubjectNames.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center overflow-x-auto px-2 sm:px-6 no-scrollbar">
            <SubjectTabs
              subjects={filteredSubjectNames}
              selected={selectedSubject}
              setSelected={onSelectSubject}
            />
          </div>
        </>
      )}
      <AnimatePresence mode="wait">
        {selectedBlock ? (
          <motion.section
            key={selectedBlock.subjectName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 sm:mt-8 space-y-5 sm:space-y-8"
          >
            {selectedBlock.questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                selected={answers[q.id]}
                showAnswer={showAnswer[q.id]}
                onSelect={(choice) => handleSelect(q.id, choice)}
                onToggle={() => toggleAnswer(q)}
              />
            ))}
            <div className="flex flex-row sm:flex-row justify-center items-center gap-3 mt-8">
              <Button
                variant="neutral"
                onClick={() => {
                  if (selectedIndex > 0) {
                    setSelectedSubject(filteredSubjectNames[selectedIndex - 1]);
                    scrollToTop();
                  }
                }}
                disabled={selectedIndex <= 0}
                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                이전 과목
              </Button>
              <Button
                onClick={() => {
                  if (selectedIndex < filteredSubjectNames.length - 1) {
                    setSelectedSubject(filteredSubjectNames[selectedIndex + 1]);
                    scrollToTop();
                  }
                }}
                disabled={selectedIndex >= filteredSubjectNames.length - 1}
                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm"
              >
                다음 과목
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.section>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <EmptyMessage />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
