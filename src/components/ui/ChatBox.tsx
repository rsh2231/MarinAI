"use client";

import { useAskLLM } from "@/hooks/useAskLLM";
import Button from "./Button";

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
    setCertificate,
  } = useAskLLM();

  const certificates = ['항해사', '기관사', '소형선박조종사'];
  const subjects = ["기관1", "기관2", "기관3", "직무일반", "영어"];
  const modes = ["초급", "고급"];

  return (
    <div className="bg-[#1f2937] text-white p-6 rounded-xl shadow-lg border border-gray-700 max-w-3xl mx-auto">
      {/* 타이틀 */}
      <h2 className="text-2xl font-bold mb-6 text-center">
        AI 질의응답
      </h2>

      {/* 자격 선택 */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">자격 선택</h3>
        <div className="flex flex-wrap gap-2">
          {certificates.map((cert) => (
            <Button
              key={cert}
              onClick={() => setCertificate(cert)}
              selected={certificate === cert}
              variant="neutral"
              size="md"
            >
              {cert}
            </Button>
          ))}
        </div>
      </div>

      {/* 과목 선택 */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">과목 선택</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subj) => (
            <Button
              key={subj}
              onClick={() => setSubject(subj)}
              selected={subject === subj}
              variant="neutral"
              size="md"
            >
              {subj}
            </Button>
          ))}
        </div>
      </div>

      {/* 난이도 선택 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">해설 난이도</h3>
        <div className="flex gap-2">
          {modes.map((m) => (
            <Button
              key={m}
              onClick={() => setMode(m)}
              selected={mode === m}
              variant="neutral"
              size="md"
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* 질문 입력 */}
      <textarea
        className="w-full bg-[#111827] border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg p-3 mb-5 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="예: 항해 중 충돌 회피 규칙은?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* 질문 버튼 */}
      <div className="text-right">
        <Button
          onClick={ask}
          disabled={loading}
          variant="primary"
        >
          {loading ? "생성 중..." : "질문하기"}
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-red-400 mt-2">{error}</p>}

      {/* AI 응답 */}
      {answer && (
        <div className="mt-6 bg-[#111827] border border-gray-700 p-4 rounded-lg">
          <h4 className="text-base font-semibold text-blue-300 mb-2">✅ AI 답변</h4>
          <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
