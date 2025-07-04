"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

import SubjectTabs from "./SubjectTabs";
import QuestionCard from "./QuestionCard";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { Question, ProblemData } from "@/types/ProblemViwer";
import { getCode } from "@/utils/getCode";
import Button from "@/components/ui/Button";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

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
  const [data, setData] = useState<ProblemData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, levelStr);
  const filePath = `/data/${license}/${code}/${code}.json`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("문제 파일을 불러올 수 없습니다.");
        const json = await res.json();
        setData(json);
        setAnswers({});
        setShowAnswer({});
        setError("");
        setSelectedSubject(null);
      } catch (err: any) {
        setError(err.message);
        setData(null);
      }
    };
    fetchData();
  }, [filePath]);

  const normalizeSubject = (s: string) => s.replace(/^\d+\.\s*/, "");

  const filteredSubjects = useMemo(() => {
    if (!data) return [];
    if (selectedSubjects.length === 0) return [];
    return data.subject.type.filter((t) =>
      selectedSubjects.includes(normalizeSubject(t.string))
    );
  }, [data, selectedSubjects]);

  const filteredSubjectNames = useMemo(() => {
    return filteredSubjects.map((t) => t.string);
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
    (t) => t.string === selectedSubject
  );
  const selectedIndex = filteredSubjectNames.findIndex(
    (s) => s === selectedSubject
  );

  // 정답 선택 처리
  const handleSelect = (question: Question, choice: string) => {
    const qNum = question.num;
    const correct = question.answer;
    setAnswers((prev) => ({ ...prev, [qNum]: choice }));

    toast[choice === correct ? "success" : "error"](
      choice === correct ? "✅ 정답입니다!" : "❌ 오답입니다.",
      { position: "top-center", autoClose: 1200 }
    );
  };

  // 해설 보기/오답노트 저장 처리
  const toggleAnswer = (question: Question) => {
    const qNum = question.num;
    const isNowShowing = !showAnswer[qNum];
    setShowAnswer((prev) => ({ ...prev, [qNum]: isNowShowing }));

    if (isNowShowing) {
      const selected = answers[qNum];
      if (selected && selected !== question.answer) {
        const savedNotes = loadWrongNotes();
        if (
          !savedNotes.find((note) => note.question === question.questionsStr)
        ) {
          saveWrongNote({
            id: uuidv4(),
            question: question.questionsStr,
            explanation: question.explanation ?? "",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  if (error) {
    return <p className="text-danger text-center mt-6 text-sm">⚠️ {error}</p>;
  }

  if (!data) {
    return (
      <p className="text-gray-400 text-center mt-6 text-sm">
        문제를 불러오는 중입니다...
      </p>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-20 text-foreground-dark">
      {selectedBlock && (
        <h2 className="text-s xs:text-base sm:text-2xl font-semibold mb-3 text-center px-2 truncate">
          {year}년 &gt;{" "} {license} &gt;{" "} {levelStr && `${levelStr}급`} &gt;{" "}
          {round}
        </h2>
      )}

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
                  filteredSubjectNames.length > 0
                    ? ((selectedIndex + 1) / filteredSubjectNames.length) * 100
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
            {selectedBlock.questions.map((q) => (
              <QuestionCard
                key={q.num}
                question={q}
                selected={answers[q.num]}
                showAnswer={showAnswer[q.num]}
                onSelect={(choice) => handleSelect(q, choice)}
                onToggle={() => toggleAnswer(q)}
                license={license}
                code={code}
              />
            ))}

            <div className="flex flex-row sm:flex-row justify-between items-center gap-3 mt-8">
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
                <ArrowBackIos className="mr-1 text-xs sm:text-sm" />
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
                <ArrowForwardIos className="ml-1 text-xs sm:text-sm" />
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-gray-400 text-center mt-12 px-4 py-10 border border-gray-700 rounded-xl bg-[#1f2937]/40 shadow-inner mx-2"
          >
            <span className="text-4xl mb-3">📭</span>
            <span className="text-base sm:text-lg font-medium text-blue-300">
              선택한 과목에 해당하는 문제가 없습니다.
            </span>
            <span className="text-sm text-gray-500 mt-2">
              사이드바에서 과목을 선택해 보세요.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}