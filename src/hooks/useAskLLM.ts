import { useState } from "react";

export function useAskLLM() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [certificate, setCertificate] = useState("항해사");  // 추가
  const [subject, setSubject] = useState("기관1");
  const [mode, setMode] = useState("초급");

  const ask = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, certificate, subject, mode }), // certificate 포함
      });
      if (!res.ok) throw new Error("응답 실패");

      const data = await res.json();
      setAnswer(data.answer);
    } catch (e) {
      setError("답변 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return {
    question,
    setQuestion,
    answer,
    loading,
    error,
    ask,
    certificate,
    setCertificate,
    subject,
    setSubject,
    mode,
    setMode,
  };
}
