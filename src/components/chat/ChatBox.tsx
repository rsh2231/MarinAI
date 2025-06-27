"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Message } from "@/types/Message";
import Button from "../ui/Button";
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // 입력 시 높이 자동 조절
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // 초기 질문이 있으면 메시지에 추가
  useEffect(() => {
    if (initialQuestion.trim()) {
      setMessages([
        { id: crypto.randomUUID(), role: "user", content: initialQuestion },
      ]);
      setInput("");
    }
  }, [initialQuestion]);

  // 스크롤 아래로 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 서버에 질문 보내고 답변 받기
  const sendMessage = async (msg: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      console.log(res)

      if (!res.ok) throw new Error("서버 응답 오류");

      const data = await res.json();

      // assistant 메시지 추가
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("질문 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 사용자 메시지 전송 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: input.trim() },
    ]);
    await sendMessage(input.trim());
    setInput("");

    // 재출 후 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full rounded-2xl border border-gray-700 bg-background-dark p-5 shadow-card">
      {/* 메시지 영역 */}
      <div className="flex-grow overflow-y-auto max-h-[500px] mb-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`relative p-3 rounded-xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap
      ${
        msg.role === "user"
          ? "bg-primary text-white self-end"
          : "bg-gray-700 text-white self-start"
      }
    `}
          >
            {/* 꼬리 말풍선 */}
            <div
              className={`
        absolute bottom-0 w-0 h-0 border-t-[10px] border-t-transparent
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
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={loading}
      />
    </div>
  );
}
