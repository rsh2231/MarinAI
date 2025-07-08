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
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (initialQuestion.trim()) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: initialQuestion,
      };
      setMessages([userMessage]);
      setInput("");
      sendMessage(userMessage.content, null);
    }
  }, [initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg: string, image: File | null) => {
    if (!msg.trim() && !image) return;

    setLoading(true);
    setIsTyping(true);

    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const formData = new FormData();
      formData.append("message", msg.trim());
      if (image) formData.append("image", image);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!res.ok || !res.body) throw new Error("API 요청 실패");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes("<img")) {
          const match = chunk.match(/<img src=["'](.*?)["']/);
          if (match && match[1]) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId ? { ...m, image: match[1] } : m
              )
            );
          }
        }

        for (let i = 0; i < chunk.length; i++) {
          const char = chunk[i];
          await new Promise((r) => setTimeout(r, 25));

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: m.content + char }
                : m
            )
          );

          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
      }
    } catch (error) {
      console.error("전송 오류:", error);
      toast.error("답변 생성 중 오류 발생");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: "⚠️ 답변을 불러오지 못했습니다." }
            : m
        )
      );
    } finally {
      setLoading(false);
      setIsTyping(false);
      setUploadedImage(null); // 🔹 이미지 초기화
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedImage) return;

    const userMessageContent = input.trim();
    const userMessageImage = uploadedImage
      ? URL.createObjectURL(uploadedImage)
      : undefined;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessageContent,
        image: userMessageImage,
      },
    ]);

    await sendMessage(userMessageContent, uploadedImage);

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleImageSelect = (file: File | null) => {
    setUploadedImage(file);
    if (file) toast.info(`'${file.name}' 이미지가 첨부되었습니다.`);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full rounded-2xl border border-gray-700 bg-background-dark p-5 shadow-card">
      <div className="flex-grow overflow-y-auto max-h-[500px] mb-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-background-dark">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`relative p-3 rounded-xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap
                ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-700 text-gray-300"
                } break-words`}
            >
              <div
                className={`absolute bottom-0 w-0 h-0 border-t-[10px] border-t-transparent
                  ${
                    msg.role === "user"
                      ? "right-[-8px] border-l-[10px] border-l-primary"
                      : "left-[-8px] border-r-[10px] border-r-gray-700"
                  }`}
              />
              {msg.content}
              {msg.image && (
                <div className="mt-2">
                  <img
                    src={msg.image}
                    alt="첨부 이미지"
                    className="max-w-full max-h-[300px] rounded border border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="text-gray-400 italic text-sm mb-2 select-none self-start">
          AI가 타이핑 중...
        </div>
      )}

      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        disabled={loading || isTyping}
        textareaRef={textareaRef}
        onImageUpload={handleImageSelect}
        uploadedImage={uploadedImage}
      />
    </div>
  );
}
