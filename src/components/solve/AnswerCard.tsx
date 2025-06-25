"use client";

type Props = {
  explanation: string;
};

export default function AnswerCard({ explanation }: Props) {
  const lines = explanation.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-blue-700 mb-1">✅ AI 해설</h2>

      {lines.map((line, index) => {
        // ✅ 정답 강조
        if (
          line.includes("정답") ||
          line.toLowerCase().includes("answer") ||
          line.toLowerCase().startsWith("correct")
        ) {
          return (
            <p
              key={index}
              className="bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-md"
            >
              {line}
            </p>
          );
        }

        // ❌ 오답 또는 보기 설명
        if (
          line.includes("오답") ||
          line.toLowerCase().includes("wrong") ||
          line.startsWith("-") ||
          line.match(/^①|②|③|④|⑤/)
        ) {
          return (
            <div
              key={index}
              className="bg-red-50 border-l-4 border-red-400 pl-4 pr-2 py-2 text-gray-800 rounded-sm"
            >
              {line}
            </div>
          );
        }

        // 일반 설명
        return (
          <p key={index} className="text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
