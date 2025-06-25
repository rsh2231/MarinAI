"use client";

import { useAskLLM } from "@/hooks/useAskLLM";

export default function ChatBox() {
  const { question, setQuestion, answer, loading, error, ask, subject, setSubject, mode, setMode } = useAskLLM();

  const subjects = ["기관1", "기관2", "기관3", "직무일반", "영어"]
  const modes = ["초급", "고급"];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">AI 질문</h2>

      {/* 과목 선택 */}
      <div className="mb-2 flex gap-2 flex-wrap">
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => setSubject(subj)}
            className={`px-3 py-1 rounded border ${
              subject === subj ? "bg-blue-600 text-white" : "bg-gray-100"
            } cursor-pointer`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* 난이도 선택 */}
      <div className="mb-2 flex gap-2">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded border ${
              mode === m ? "bg-blue-500 text-white" : "bg-gray-100"
            } cursor-pointer`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        className="w-full border rounded p-2 mb-2 min-h-[100px]"
        placeholder="예: 항해 중 충돌 회피 규칙은?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={ask}
        disabled={loading}
      >
        {loading ? "생성 중..." : "질문하기"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {answer && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <strong>AI 답변:</strong>
          <p className="mt-2 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}
