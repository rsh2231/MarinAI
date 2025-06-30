"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
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
}

export default function ProblemViewer({ year, license, level, round }: Props) {
  const [data, setData] = useState<ProblemData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const code = getCode(license, year, round, level);
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
        setSelectedSubject(json.subject.type[0].string);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [filePath]);

  const handleSelect = (qNum: string, choice: string, question: Question) => {
    const correct = question.answer;
    setAnswers((prev) => ({ ...prev, [qNum]: choice }));

    toast[choice === correct ? "success" : "error"](
      choice === correct ? "✅ 정답입니다!" : "❌ 오답입니다.",
      { position: "top-center", autoClose: 1200 }
    );
  };

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

  const subjects = data.subject.type.map((t) => t.string);
  const selectedBlock = data.subject.type.find((t) => t.string === selectedSubject);
  const selectedIndex = subjects.findIndex((s) => s === selectedSubject);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 text-foreground-dark">
      {/* 문제 경로 정보 */}
      {selectedBlock && (
        <h2 className="text-lg sm:text-xl font-semibold mb-3">
          {year}년 {round} {license} {levelStr && `${levelStr}급`} &gt;{" "}
          <span className="text-primary">{selectedBlock.string}</span>
        </h2>
      )}

      {/* 진행률 바 */}
      <div className="w-full mb-6">
        <div className="text-sm text-gray-400 mb-1 text-center">
          {selectedIndex + 1} / {subjects.length} 과목
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((selectedIndex + 1) / subjects.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 탭 */}
      <SubjectTabs
        subjects={subjects}
        selected={selectedSubject}
        setSelected={setSelectedSubject}
      />

      {/* 문제 카드 렌더링 */}
      {selectedBlock ? (
        <section className="mt-6 space-y-8">
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

          {/* 과목 전환 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-10">
            <Button
              variant="neutral"
              onClick={() => {
                setSelectedSubject(subjects[selectedIndex - 1]);
                scrollToTop();
              }}
              disabled={selectedIndex === 0}
            >
              <ArrowBackIos className="mr-1 text-sm" />
              이전 과목
            </Button>

            <Button
              onClick={() => {
                setSelectedSubject(subjects[selectedIndex + 1]);
                scrollToTop();
              }}
              disabled={selectedIndex === subjects.length - 1}
            >
              다음 과목
              <ArrowForwardIos className="ml-1 text-sm" />
            </Button>
          </div>
        </section>
      ) : (
        <p className="text-gray-400 mt-6">선택된 과목의 문제가 없습니다.</p>
      )}
    </div>
  );
}
