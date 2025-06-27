"use client";

import React, { useRef, useEffect } from "react";
import Button from "../ui/Button";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e:React.FormEvent) => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoResizeTextarea(textareaRef, value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);

    // 전송 후 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          placeholder="질문을 입력하세요..."
          disabled={disabled}
          className="w-full resize-none px-4 py-2 rounded-lg border border-gray-600 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm leading-relaxed max-h-40 overflow-y-auto"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={disabled}
          variant="neutral"
          className="px-4 py-2 text-sm font-medium"
        >
          {disabled ? "전송 중..." : "전송"}
        </Button>
      </div>
    </form>
  );
}
