"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import {
  groupedQuestionsAtom,
  answersAtom,
  currentQuestionIndexAtom,
  isOmrVisibleAtom,
} from "@/atoms/examAtoms";

import SubjectTabs from "../solve/SubjectTabs";
import QuestionCard from "../solve/QuestionCard";
import {
  Question,
  QuestionWithSubject,
  ProblemData,
} from "@/types/ProblemViwer";
import { getCode } from "@/utils/getCode";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyMessage } from "../ui/EmptyMessage";
import { OmrSheet } from "@/components/exam/OmrSheet";

// 타입
type LicenseType = "기관사" | "항해사" | "소형선박조종사";

interface Props {
  year: string;
  license: LicenseType;
  level: string;
  round: string;
  selectedSubjects: string[];
  durationSeconds?: number;
}

export default function ExamViewer({
  year,
  license,
  level,
  round,
  selectedSubjects,
  durationSeconds = 3600,
}: Props) {
  const [data, setData] = useState<ProblemData | null>(null);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);

  const [groupedQuestions, setGroupedQuestions] = useAtom(groupedQuestionsAtom);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [, setCurrentIdx] = useAtom(currentQuestionIndexAtom);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, levelStr);
  const filePath = `/data/${license}/${code}/${code}.json`;

  const normalizeSubject = (s: string) => s.replace(/^\d+\.\s*/, "");

  // 1. 문제 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("문제 파일을 불러올 수 없습니다.");
        const json = await res.json();
        setData(json);
        setAnswers({});
        setGroupedQuestions([]);
        setSelectedSubject(null);
        setTimeLeft(durationSeconds);
        setError("");
        setCurrentIdx(0);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [filePath, durationSeconds]);

  // 2. 과목 필터링
  const filteredSubjects = useMemo(() => {
    if (!data) return [];
    return data.subject.type.filter((t) =>
      selectedSubjects.includes(normalizeSubject(t.string))
    );
  }, [data, selectedSubjects]);

  const filteredSubjectNames = useMemo(
    () => filteredSubjects.map((t) => t.string),
    [filteredSubjects]
  );

  const selectedIndex = filteredSubjectNames.findIndex(
    (s) => s === selectedSubject
  );
  const selectedBlock = filteredSubjects.find(
    (t) => t.string === selectedSubject
  );

  // 3. groupedQuestionsAtom 설정
  useEffect(() => {
    if (data) {
      const normalized = data.subject.type
        .filter((t) => selectedSubjects.includes(normalizeSubject(t.string)))
        .map((block) => ({
          subjectName: block.string,
          questions: block.questions.map((q) => ({
            ...q,
            subject: block.string,
            subjectName: block.string,
          })),
        }));

      setGroupedQuestions(normalized);
    }
  }, [data, selectedSubjects, setGroupedQuestions]);

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

  // 4. 타이머
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelect = (q: QuestionWithSubject, choice: string) => {
    const key = `${q.subjectName}-${q.num}`;
    setAnswers((prev) => ({ ...prev, [key]: choice }));
  };

  if (error)
    return <p className="text-danger text-center mt-6 text-sm">⚠️ {error}</p>;
  if (!data)
    return (
      <p className="text-gray-400 text-center mt-6 text-sm">
        문제를 불러오는 중입니다...
      </p>
    );

  return (
    <div className="relative w-full max-w-3xl mx-auto px-2 sm:px-4 pb-10 text-foreground-dark">
      <OmrSheet />

      <div className="fixed top-2 right-2 z-10 flex items-center bg-gray-800 px-3 py-1 rounded-lg text-blue-400 font-mono select-none">
        {formatTime(timeLeft)}
      </div>

      {filteredSubjectNames.length > 0 && (
        <>
          <div className="w-full mb-4 flex justify-center px-2">
            <div className="w-full sm:w-3/4 md:w-1/2">
              <div className="flex items-center justify-center text-xs xs:text-sm text-gray-300 mb-1">
                <div className="flex items-center gap-1 xs:gap-2">
                  <span className="text-blue-400 text-base xs:text-lg">📘</span>
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
                      ((selectedIndex + 1) / filteredSubjectNames.length) * 100
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
            key={selectedBlock.string}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 sm:mt-8 space-y-5 sm:space-y-8 px-2"
          >
            {selectedBlock.questions.map((q, idx) => {
              const enrichedQuestion: QuestionWithSubject = {
                ...q,
                subjectName: selectedBlock.string,
              };

              return (
                <QuestionCard
                  key={enrichedQuestion.num}
                  question={enrichedQuestion}
                  selected={
                    answers[
                      `${enrichedQuestion.subjectName}-${enrichedQuestion.num}`
                    ]
                  }
                  showAnswer={false}
                  onSelect={(choice) => {
                    handleSelect(enrichedQuestion, choice);
                    setCurrentIdx(
                      groupedQuestions
                        .flatMap((g) => g.questions)
                        .findIndex(
                          (item) =>
                            `${item.subjectName}-${item.num}` ===
                            `${enrichedQuestion.subjectName}-${enrichedQuestion.num}`
                        )
                    );
                  }}
                  license={license}
                  code={code}
                />
              );
            })}

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
                <ChevronLeft className="mr-1 text-xs sm:text-sm" />
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
                <ChevronRight className="ml-1 text-xs sm:text-sm" />
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
