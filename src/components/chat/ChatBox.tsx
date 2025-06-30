"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Message } from "@/types/Message";
import ChatInput from "./ChatInput";

interface ChatBoxProps {
  initialQuestion: string;
}

export default function ChatBox({ initialQuestion }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 문자열을 인자로 받아 처리 (ChatInput에 넘길 함수)
  const handleInputChange = (value: string) => {
    setInput(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (initialQuestion.trim()) {
      const id = crypto.randomUUID();
      setMessages([{ id, role: "user", content: initialQuestion }]);
      setInput("");
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg: string) => {
    setLoading(true);
    const id = crypto.randomUUID();

    // 답변 로딩 중 표시
    setMessages((prev) => [...prev, { id, role: "assistant", content: "답변 생성 중..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) throw new Error("서버 응답 오류");

      const data = await res.json();
      const fullText = data.answer as string;

      let currentText = "";

      for (let i = 0; i < fullText.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        currentText += fullText[i];
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, content: currentText } : m))
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("질문 처리 중 오류가 발생했습니다.");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: "⚠️ 답변을 불러오지 못했습니다." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: input.trim() },
    ]);
    await sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full rounded-2xl border border-gray-700 bg-background-dark p-5 shadow-card">
      {/* 메시지 영역 */}
      <div className="flex-grow overflow-y-auto max-h-[500px] mb-5 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-background-dark">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`relative p-3 rounded-xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap
              ${
                msg.role === "user"
                  ? "bg-primary text-white self-end"
                  : "bg-gray-700 text-gray-300 self-start"
              }
              break-words
            `}
          >
            {/* 꼬리 말풍선 */}
            <div
              className={`absolute bottom-0 w-0 h-0 border-t-[10px] border-t-transparent
                ${
                  msg.role === "user"
                    ? "right-[-10px] border-l-[10px] border-l-primary"
                    : "left-[-10px] border-r-[10px] border-r-gray-700"
                }
              `}
              style={{ top: "90%" }}
            />
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <ChatInput
        value={input}
        onChange={handleInputChange} 
        onSubmit={handleSubmit}
        disabled={loading}
        textareaRef={textareaRef}
      />
    </div>
  );
}
