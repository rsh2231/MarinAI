"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { Question, ProblemData } from "@/types/ProblemViwer";
import { toast } from "react-toastify";

type Props = {
  year: string;
  license: string;
  level: string;
  round: string;
};

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

  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
  if (!data) return <p className="text-gray-500 text-center mt-4">문제를 불러오는 중입니다...</p>;

  const subjects = data.subject.type.map((t) => t.string);
  const selectedTypeBlock = data.subject.type.find((t) => t.string === selectedSubject);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      {/* 탭 버튼 */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            className={`py-2 px-4 whitespace-nowrap border-b-2 -mb-px font-semibold ${
              subj === selectedSubject
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-blue-500"
            }`}
            aria-selected={subj === selectedSubject}
            role="tab"
          >
            {subj}
          </button>
        ))}
      </div>

      {/* 문제 리스트 */}
      {selectedTypeBlock ? (
        <section>
          <h2 className="text-xl font-bold text-blue-700 mb-4">{selectedTypeBlock.string}</h2>

          {selectedTypeBlock.questions.map((q) => {
            const selected = answers[q.num];
            const correctAnswer = q.answer;

            const options = [
              { label: "가", value: q.ex1Str },
              { label: "나", value: q.ex2Str },
              { label: "사", value: q.ex3Str },
              { label: "아", value: q.ex4Str },
            ];

            const { textWithoutImage, imageCode } = extractImageCode(q.questionsStr);
            const finalImageCode = q.image ?? imageCode;

            const hasImage =
              typeof finalImageCode === "string" && finalImageCode.trim().length > 0;
            const imagePath = hasImage
              ? `/data/${license}/${code}/${code}-${finalImageCode}.png`
              : null;

            return (
              <article key={q.num} className="bg-white border p-4 rounded-xl shadow-sm mb-6">
                <div className="font-semibold mb-3 text-lg text-gray-800 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <span className="text-gray-500 flex-shrink-0">문제 {q.num}</span>
                  <p className="whitespace-pre-wrap">{textWithoutImage}</p>
                </div>

                {hasImage && imagePath && (
                  <div className="my-3 flex justify-center">
                    <Image
                      src={imagePath}
                      alt={`문제 ${q.num} 이미지`}
                      width={600}
                      height={400}
                      className="rounded border"
                      priority={false}
                    />
                  </div>
                )}

                <ul className="space-y-2 mt-2">
                  {options.map((opt) => {
                    const isSelected = selected === opt.label;
                    const isCorrect = opt.label === correctAnswer;
                    const isWrong = isSelected && !isCorrect && showAnswer[q.num];

                    let classes = "border p-2 rounded cursor-pointer select-none";
                    if (isSelected) classes += " border-blue-600 bg-blue-50";
                    if (showAnswer[q.num]) {
                      if (isCorrect) classes += " bg-green-100 border-green-500";
                      if (isWrong) classes += " bg-red-100 border-red-500";
                    }

                    return (
                      <li
                        key={opt.label}
                        className={classes}
                        onClick={() => handleSelect(q.num, opt.label, q)}
                      >
                        {opt.label}. {opt.value}
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() => toggleAnswer(q.num, q)}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  {showAnswer[q.num] ? "정답 숨기기" : "정답 보기"}
                </button>

                {showAnswer[q.num] && (
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    ✅ 정답: {correctAnswer}
                    {q.explanation && (
                      <p className="mt-1 text-gray-600">💡 해설: {q.explanation}</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <p className="text-gray-500">선택된 과목의 문제가 없습니다.</p>
      )}
    </div>
  );
}