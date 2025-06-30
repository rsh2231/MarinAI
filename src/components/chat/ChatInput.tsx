"use client";

import React from "react";
import Button from "../ui/Button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  textareaRef,
}: ChatInputProps) {
  // 엔터 누를 때 Shift+Enter는 줄바꿈, Enter는 제출
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const syntheticSubmitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      e.currentTarget.form?.dispatchEvent(syntheticSubmitEvent);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)} // 문자열만 전달
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="질문을 입력하세요..."
        className="flex-grow p-2 rounded border border-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={disabled}
        required
      />
      <Button type="submit" variant="neutral" disabled={disabled}>
        <Send>전송</Send>
      </Button>
    </form>
  );
}
