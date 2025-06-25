"use client";

import { useAskLLM } from "@/hooks/useAskLLM";

export default function ChatBox() {
  const {
    question,
    setQuestion,
    answer,
    loading,
    error,
    ask,
    subject,
    setSubject,
    mode,
    setMode,
    certificate,
    setCertificate,   // 자격증 상태 추가
  } = useAskLLM();

  const certificates = ['항해사', '기관사', '소형선박조종사'];
  const subjects = ["기관1", "기관2", "기관3", "직무일반", "영어"];
  const modes = ["초급", "고급"];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-3xl mx-auto">
      {/* 타이틀 */}
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
        🎓 AI 질의응답
      </h2>

      {/* 자격 선택 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">자격 선택</h3>
        <div className="flex flex-wrap gap-2">
          {certificates.map((cert) => (
            <button
              key={cert}
              onClick={() => setCertificate(cert)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                certificate === cert
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      {/* 과목 선택 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">과목 선택</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSubject(subj)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                subject === subj
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* 난이도 선택 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">해설 난이도</h3>
        <div className="flex gap-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                mode === m
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 질문 입력 */}
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-300"
        placeholder="예: 항해 중 충돌 회피 규칙은?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* 질문 버튼 */}
      <div className="text-right">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
          onClick={ask}
          disabled={loading}
        >
          {loading ? "생성 중..." : "질문하기"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* AI 응답 */}
      {answer && (
        <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h4 className="text-base font-semibold text-gray-800 mb-2">✅ AI 답변</h4>
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
