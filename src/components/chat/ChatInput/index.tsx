"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from "react-toastify";
import {
  X,
  Plus,
  ArrowUp,
  Paperclip,
  Mic,
  FileText,
  Image as ImageIcon,
  Square,
} from "lucide-react";

// 1. 새 훅/컴포넌트 import
import useImageDropPaste from '../../../hooks/useImageDropPaste';
import ChatImagePreview from "./ChatImagePreview";
import ChatInputMenu from './ChatInputMenu';

// 팝업 메뉴 아이콘 데이터
const menuIcons = [
  { icon: Paperclip, label: "파일", action: () => toast.info("파일 기능은 준비 중입니다.") },
  { icon: Mic, label: "음성", action: () => toast.info("음성 기능은 준비 중입니다.") },
  { icon: FileText, label: "템플릿", action: () => toast.info("템플릿 기능은 준비 중입니다.") },
];

// 컴포넌트 Props 타입 정의
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageUpload: (file: File | null) => void;
  uploadedImage: File | null;
  disabled?: boolean;
  placeholder?: string;
  onStop?: () => void;
}

export default function index({
  value,
  onChange,
  onSubmit,
  onImageUpload,
  uploadedImage,
  disabled,
  placeholder = "무엇이든 물어보세요",
  onStop,
}: ChatInputProps) {
  // 2. 이미지/드래그/붙여넣기 훅 사용
  const {
    previewUrl,
    isDragging,
    setIsDragging,
    fileInputRef,
    handleImageChange,
    handleRemoveImage,
    handlePaste,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useImageDropPaste({ uploadedImage, onImageUpload, disabled });

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // 팝업 메뉴의 이미지 아이콘 클릭 핸들러
  const handleImageIconClick = () => {
    fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  // Enter 키로 제출
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      if (value.trim() || uploadedImage) {
        e.preventDefault();
        onSubmit(e as any);
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`relative flex w-full flex-col rounded-2xl border bg-neutral-800/50 p-3 shadow-lg backdrop-blur-sm transition-colors ${isDragging ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-neutral-700'}`}
      >
        {/* 이미지 미리보기 분리 */}
        <ChatImagePreview previewUrl={previewUrl} onRemove={handleRemoveImage} />

        <div className="flex w-full items-end gap-2">
          <TextareaAutosize
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent py-2.5 text-base text-neutral-200 placeholder-neutral-500 focus:outline-none"
            rows={1}
            maxRows={8}
            disabled={disabled}
            onPaste={handlePaste}
          />
          <div className="flex flex-shrink-0 items-center gap-2">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} disabled={disabled}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700/60 text-neutral-300 transition-colors hover:bg-neutral-700">
              <Plus size={20} />
            </button>
            {/* 전송/중단 버튼 */}
            <button
              type={disabled ? 'button' : 'submit'}
              onClick={disabled && onStop ? onStop : undefined}
              disabled={!disabled && !value.trim() && !uploadedImage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed"
              aria-label={disabled ? "생성 중단" : "전송"}
            >
              {disabled ? <Square size={18} /> : <ArrowUp size={20} />}
            </button>
          </div>
        </div>
      </div>
      {/* 팝업 메뉴 분리 */}
      <ChatInputMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onImageIconClick={handleImageIconClick}
      />
      <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} disabled={disabled} />
    </form>
  );
}