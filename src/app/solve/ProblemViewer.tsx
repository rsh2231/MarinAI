"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { Question, ProblemData } from "@/types/ProblemViwer";
import Button from "../../components/ui/Button";

// Props 정의
interface Props {
  year: string;
  license: string;
  level: string;
  round: string;
}

export default function ProblemViewer({ year, license, level, round }: Props) {
  const [data, setData] = useState<ProblemData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const licenseCodeMap: Record<string, string> = {
    기관사: "E",
    항해사: "D",
    소형선박조종사: "S",
  };

  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const roundNum = round.replace("회", "").padStart(2, "0");
  const code = `${licenseCodeMap[license]}${levelStr}_${year}_${roundNum}`;
  const filePath = `/data/${license}/${code}/${code}.json`;

  const extractImageCode = (text: string) => {
    const regex = /@pic(\d+)/;
    const match = text.match(regex);
    if (match) {
      return {
        textWithoutImage: text.replace(regex, "").trim(),
        imageCode: `pic${match[1]}`,
      };
    }
    return { textWithoutImage: text, imageCode: null };
  };

  useEffect(() => {
    const fetchData = async () => {
      setError("");
      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("문제 파일을 불러올 수 없습니다.");
        const json = await res.json();
        setData(json);
        setAnswers({});
        setShowAnswer({});
        if (json.subject.type.length > 0) {
          setSelectedSubject(json.subject.type[0].string);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [filePath]);

  const getAnswerLabel = (text: string) => {
    const validLabels = ["가", "나", "사", "아"];
    return validLabels.includes(text) ? text : "";
  };

  const handleSelect = (qNum: string, choice: string, question: Question) => {
    const correctLabel = getAnswerLabel(question.answer);
    setAnswers((prev) => ({ ...prev, [qNum]: choice }));

    if (choice === correctLabel) {
      toast.success("정답입니다! 🎉");
    } else {
      toast.error("오답입니다. ❌");
    }
  };

  const toggleAnswer = (qNum: string, question: Question) => {
    setShowAnswer((prev) => ({ ...prev, [qNum]: !prev[qNum] }));

    const selected = answers[qNum];
    const correctLabel = getAnswerLabel(question.answer);

    if (selected && selected !== correctLabel) {
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

  if (error)
    return <p className="text-red-400 text-center mt-4 text-sm">⚠️ {error}</p>;
  if (!data)
    return (
      <p className="text-gray-400 text-center mt-4 text-sm">
        문제를 불러오는 중입니다...
      </p>
    );

  const subjects = data.subject.type.map((t) => t.string);
  const selectedTypeBlock = data.subject.type.find((t) => t.string === selectedSubject);
  const selectedIndex = subjects.findIndex((s) => s === selectedSubject);

  const handlePrevSubject = () => {
    if (selectedIndex > 0) {
      setSelectedSubject(subjects[selectedIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextSubject = () => {
    if (selectedIndex < subjects.length - 1) {
      setSelectedSubject(subjects[selectedIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 text-white">
      {/* 탭 버튼 */}
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            className={`not-[]:py-2 px-4 whitespace-nowrap border-b-2 font-medium transition-all duration-150 text-sm
              ${subj === selectedSubject
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-blue-300"}`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* 문제 리스트 */}
      {selectedTypeBlock ? (
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-300 mb-6">
            {selectedTypeBlock.string}
          </h2>

          {selectedTypeBlock.questions.map((q) => {
            const selected = answers[q.num];
            const correctAnswer = q.answer;

            const options = [
              { label: "가", value: q.ex1Str },
              { label: "나", value: q.ex2Str },
              { label: "사", value: q.ex3Str },
              { label: "아", value: q.ex4Str },
            ];

            const correctOption = options.find((opt) => opt.label === correctAnswer);
            const correctText = correctOption ? correctOption.value : "";

            const { textWithoutImage, imageCode } = extractImageCode(q.questionsStr);
            const finalImageCode = q.image ?? imageCode;

            const hasImage = typeof finalImageCode === "string" && finalImageCode.trim().length > 0;
            const imagePath = hasImage
              ? `/data/${license}/${code}/${code}-${finalImageCode}.png`
              : null;

            return (
              <article
                key={q.num}
                className="bg-[#1f2937] border border-gray-700 rounded-xl shadow-sm mb-6 p-5"
              >
                <div className="mb-4 text-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 font-medium text-sm sm:text-base">
                    <span className="text-gray-400 flex-shrink-0">문제 {q.num}</span>
                    <p className="whitespace-pre-wrap">{textWithoutImage}</p>
                  </div>
                </div>

                {hasImage && imagePath && (
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={imagePath}
                      alt={`문제 ${q.num} 이미지`}
                      width={600}
                      height={400}
                      className="rounded border border-gray-600"
                    />
                  </div>
                )}

                <ul className="space-y-2 mt-3">
                  {options.map((opt) => {
                    const isSelected = selected === opt.label;
                    const isCorrect = opt.label === correctAnswer;
                    const isWrong = isSelected && !isCorrect && showAnswer[q.num];

                    const baseClasses = "w-full text-left px-4 py-2 rounded-md border transition-all duration-200 ease-in-out cursor-pointer select-none text-sm";
                    const selectedClasses = isSelected ? "border-blue-500 bg-blue-900/20" : "border-gray-600 hover:bg-gray-800";
                    const correctClasses = showAnswer[q.num] && isCorrect ? "bg-green-900/30 border-green-500 text-green-300" : "";
                    const wrongClasses = showAnswer[q.num] && isWrong ? "bg-red-900/30 border-red-500 text-red-300" : "";

                    const finalClasses = `${baseClasses} ${selectedClasses} ${correctClasses} ${wrongClasses}`;

                    return (
                      <li
                        key={opt.label}
                        className={finalClasses}
                        onClick={() => handleSelect(q.num, opt.label, q)}
                      >
                        <span className="mr-1">{opt.label}.</span> {opt.value}
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() => toggleAnswer(q.num, q)}
                  className="mt-4 text-sm text-blue-400 hover:underline"
                >
                  {showAnswer[q.num] ? "정답 숨기기" : "정답 보기"}
                </button>

                {showAnswer[q.num] && (
                  <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap">
                    ✅ <strong>정답 :</strong> {correctAnswer}. {correctText}
                    {q.explanation && (
                      <p className="mt-2 text-gray-400">
                        💡 <strong>해설 :</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-10">
            <Button
              variant="neutral"
              onClick={handlePrevSubject}
              disabled={selectedIndex === 0}
            >
              ← 이전 과목
            </Button>
            <Button
              onClick={handleNextSubject}
              disabled={selectedIndex === subjects.length - 1}
            >
              다음 과목 →
            </Button>
          </div>
        </section>
      ) : (
        <p className="text-gray-400">선택된 과목의 문제가 없습니다.</p>
      )}
    </div>
  );
}