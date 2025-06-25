"use client";

type Props = {
  explanation: string;
};

export default function AnswerCard({ explanation }: Props) {
  // ✨ 간단한 마크업 치환 (추후 마크다운 처리도 가능)
  const lines = explanation.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="bg-gray-100 p-4 rounded space-y-2">
      <h2 className="text-lg font-semibold text-green-700">✅ AI 해설</h2>
      {lines.map((line, index) => {
        // 정답: 키워드 강조
        if (line.includes("정답") || line.toLowerCase().includes("answer")) {
          return (
            <p key={index} className="text-blue-700 font-bold">
              {line}
            </p>
          );
        }

        // 오답 설명
        if (line.includes("오답") || line.toLowerCase().includes("wrong") || line.startsWith("-")) {
          return (
            <p key={index} className="text-gray-700 pl-4 border-l-4 border-red-300">
              {line}
            </p>
          );
        }

        return <p key={index} className="text-gray-800">{line}</p>;
      })}
    </div>
  );
}
