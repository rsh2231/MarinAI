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

const licenseCodeMap = {
  기관사: "E",
  항해사: "D",
  소형선박조종사: "S",
} as const;

type LicenseType = keyof typeof licenseCodeMap;

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
  const code = getCode(license, year, round, level);
  const filePath = `/data/${license}/${code}/${code}.json`;

  // 문제 JSON 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("문제 파일을 불러올 수 없습니다.");
        const json = await res.json();
        setData(json);
        setAnswers({});
        setShowAnswer({});
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [filePath]);

  // 숫자를 제거한 과목명 추출
  const normalizeSubject = (s: string) => s.replace(/^\d+\.\s*/, "");

  // 선택된 과목명에 맞는 데이터 필터링
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

  // 선택된 과목 설정 (선택되지 않았거나 변경되었을 때 자동 설정)
  useEffect(() => {
    if (!filteredSubjectNames.length) {
      if (selectedSubject !== null) setSelectedSubject(null);
    } else if (
      !selectedSubject ||
      !filteredSubjectNames.includes(selectedSubject)
    ) {
      setSelectedSubject(filteredSubjectNames[0]);
    }
  }, [filteredSubjectNames, selectedSubject]);

  const onSelectSubject = useCallback(
    (subj: string) => {
      setSelectedSubject(subj);
    },
    [setSelectedSubject]
  );

  const selectedBlock = filteredSubjects.find(
    (t) => t.string === selectedSubject
  );
  const selectedIndex = filteredSubjectNames.findIndex(
    (s) => s === selectedSubject
  );

  // 정답 선택 처리
  const handleSelect = (qNum: string, choice: string, question: Question) => {
    const correct = question.answer;
    setAnswers((prev) => ({ ...prev, [qNum]: choice }));

    toast[choice === correct ? "success" : "error"](
      choice === correct ? "✅ 정답입니다!" : "❌ 오답입니다.",
      { position: "top-center", autoClose: 1200 }
    );
  };

  // 해설 보기/오답노트 저장 처리
  const toggleAnswer = (qNum: string, question: Question) => {
    setShowAnswer((prev) => ({ ...prev, [qNum]: !prev[qNum] }));

    const selected = answers[qNum];
    if (selected && selected !== question.answer) {
      const savedNotes = loadWrongNotes();
      if (!savedNotes.find((note) => note.question === question.questionsStr)) {
        saveWrongNote({
          id: uuidv4(),
          question: question.questionsStr,
          explanation: question.explanation ?? "",
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  // --- 렌더링 ---

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
    <div className="max-w-4xl mx-auto px-4 pb-24 text-foreground-dark">
      {/* 상단 경로 */}
      {selectedBlock && (
        <h2 className="text-lg sm:text-xl font-semibold mb-3">
          {year}년 {license} {levelStr && `${levelStr}급`} {round} &gt;{" "}
          <span className="text-primary">
            {selectedBlock.string.replace(/^\d+\.\s*/, "")}
          </span>
        </h2>
      )}

      {/* 진행률 */}
      <div className="w-full mb-6">
        <div className="text-sm text-gray-400 mb-1 text-center">
          {selectedIndex + 1} / {filteredSubjectNames.length} 과목
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${
                ((selectedIndex + 1) / filteredSubjectNames.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* 탭 */}
      <SubjectTabs
        subjects={filteredSubjectNames}
        selected={selectedSubject}
        setSelected={onSelectSubject}
      />

      {/* 문제 카드 */}
      <AnimatePresence mode="wait">
        {selectedBlock ? (
          <motion.section
            key={selectedBlock.string}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-8"
          >
            {selectedBlock.questions.map((q) => (
              <QuestionCard
                key={q.num}
                question={q}
                selected={answers[q.num]}
                showAnswer={showAnswer[q.num]}
                onSelect={(choice) => handleSelect(q.num, choice, q)}
                onToggle={() => toggleAnswer(q.num, q)}
                license={license}
                code={code}
              />
            ))}

            {/* 과목 이동 */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-10">
              <Button
                variant="neutral"
                onClick={() => {
                  setSelectedSubject(filteredSubjectNames[selectedIndex - 1]);
                  scrollToTop();
                }}
                disabled={selectedIndex === 0}
              >
                <ArrowBackIos className="mr-1 text-sm" />
                이전 과목
              </Button>

              <Button
                onClick={() => {
                  setSelectedSubject(filteredSubjectNames[selectedIndex + 1]);
                  scrollToTop();
                }}
                disabled={selectedIndex === filteredSubjectNames.length - 1}
              >
                다음 과목
                <ArrowForwardIos className="ml-1 text-sm" />
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-gray-400 text-center mt-12 px-4 py-10 border border-gray-700 rounded-xl bg-[#1f2937]/40 shadow-inner"
          >
            <span className="text-4xl mb-3">📭</span>
            <span className="text-lg font-medium text-blue-300">
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
