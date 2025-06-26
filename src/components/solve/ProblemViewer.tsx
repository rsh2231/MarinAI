"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { saveWrongNote, loadWrongNotes } from "@/utils/localWrongNote";
import { Question, ProblemData } from "@/types/ProblemViwer";

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

  // 라이선스별 코드 매핑
  const licenseCodeMap: Record<string, string> = {
    기관사: "E",
    항해사: "D",
    소형선박조종사: "S",
  };

  // 소형선박조종사는 level이 없으므로 빈 문자열 처리
  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");

  // round는 2자리로 맞춤 (예: 1 => 01)
  const roundNum = round.replace("회", "").padStart(2, "0");

  // 코드 예: E1_2021_01
  const code = `${licenseCodeMap[license]}${levelStr}_${year}_${roundNum}`;

  // JSON 파일 경로(public/data 내부)
  const filePath = `/data/${license}/${code}/${code}.json`;

  // 문제 텍스트에서 @pic숫자 형태 추출 + 제거
  const extractImageCode = (
    text: string
  ): { textWithoutImage: string; imageCode: string | null } => {
    const regex = /@pic(\d+)/;
    const match = text.match(regex);
    if (match) {
      return {
        textWithoutImage: text.replace(regex, "").trim(),
        imageCode: `pic${match[1]}`, // pic1110 형식
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
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [filePath]);

  const handleSelect = (qNum: string, choice: string) => {
    setAnswers((prev) => ({ ...prev, [qNum]: choice }));
  };

  const getAnswerLabel = (text: string): string => {
    const validLabels = ["가", "나", "사", "아"];
    return validLabels.includes(text) ? text : "";
  };

  // 정답 보기 토글 + 오답노트 저장 (중복 저장 방지)
  const toggleAnswer = (qNum: string, question: Question) => {
    setShowAnswer((prev) => ({ ...prev, [qNum]: !prev[qNum] }));

    const selected = answers[qNum];
    const correctLabel = getAnswerLabel(question.answer);

    // 오답 노트 저장 (중복 체크)
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
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  if (!data)
    return (
      <p className="text-gray-500 text-center mt-4">
        문제를 불러오는 중입니다...
      </p>
    );

  // 정답률 계산 (total 0 대비 처리 포함)
  const total = data.subject.type.reduce(
    (acc, cur) => acc + cur.questions.length,
    0
  );
  const correct = Object.entries(answers).filter(([qNum, choice]) => {
    const found = data.subject.type
      .flatMap((t) => t.questions)
      .find((q) => q.num === qNum);
    return found && getAnswerLabel(found.answer) === choice;
  }).length;

  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 pb-16">
      <div className="text-sm text-gray-600 text-center mb-4">
        정답률: {correct} / {total} ({accuracy}%)
      </div>

      {data.subject.type.map((typeBlock, subjectIndex) => (
        <section key={typeBlock.string}>
          <h2 className="text-lg font-bold text-blue-700 mb-3">
            {typeBlock.string}
          </h2>

          {typeBlock.questions.map((q) => {
            const selected = answers[q.num];
            const correctAnswer = q.answer;

            const options = [
              { label: "가", value: q.ex1Str },
              { label: "나", value: q.ex2Str },
              { label: "사", value: q.ex3Str },
              { label: "아", value: q.ex4Str },
            ];

            // 문제 텍스트에서 이미지 코드 분리
            const { textWithoutImage, imageCode } = extractImageCode(q.questionsStr);

            // q.image가 있으면 우선 사용, 없으면 questionsStr에서 추출한 imageCode 사용
            const finalImageCode = q.image ?? imageCode;

            const hasImage =
              typeof finalImageCode === "string" && finalImageCode.trim().length > 0;
            const imagePath = hasImage
              ? `/data/${license}/${code}/${code}-${finalImageCode}.png`
              : null;

            return (
              <article
                key={q.num}
                className="bg-white border p-4 rounded-xl shadow-sm mb-6"
              >
                <div className="font-semibold mb-2">
                  <span className="text-gray-600">문제 {q.num}. </span>
                  {textWithoutImage}
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
                    const isWrong =
                      isSelected && !isCorrect && showAnswer[q.num];

                    let classes =
                      "border p-2 rounded cursor-pointer select-none";
                    if (isSelected) classes += " border-blue-600 bg-blue-50";
                    if (showAnswer[q.num]) {
                      if (isCorrect)
                        classes += " bg-green-100 border-green-500";
                      if (isWrong) classes += " bg-red-100 border-red-500";
                    }

                    return (
                      <li
                        key={opt.label}
                        className={classes}
                        onClick={() => handleSelect(q.num, opt.label)}
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
                      <p className="mt-1 text-gray-600">
                        💡 해설: {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
