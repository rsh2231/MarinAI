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
  onStop: () => void;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onImageUpload,
  uploadedImage,
  disabled,
  placeholder = "무엇이든 물어보세요...",
  onStop,
}: ChatInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // uploadedImage 상태가 변경될 때 미리보기 URL을 관리
  useEffect(() => {
    let objectUrl: string | null = null;
    if (uploadedImage) {
      objectUrl = URL.createObjectURL(uploadedImage);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
    // 클린업 함수: 컴포넌트가 언마운트되거나 이미지가 변경될 때 이전 URL 해제
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [uploadedImage]);

  // 이미지 파일 변경 핸들러 (파일 선택 버튼 클릭 시)
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    }
  };

  // 첨부된 이미지 제거
  const handleRemoveImage = () => {
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  // --- 드래그 앤 드롭 핸들러 ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    } else if (file) {
      toast.error("이미지 파일만 첨부할 수 있습니다.");
    }
  };

  // 팝업 메뉴의 이미지 아이콘 클릭 핸들러
  const handleImageIconClick = () => {
    fileInputRef.current?.click();
    setIsMenuOpen(false);
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
      <div className={`relative flex w-full flex-col rounded-2xl border bg-neutral-800/50 p-3 shadow-lg backdrop-blur-sm transition-colors ${isDragging ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-neutral-700'
        }`}>

        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-blue-900/30">
              <div className="flex flex-col items-center gap-2 text-blue-300">
                <ImageIcon size={32} />
                <span className="font-semibold">여기에 이미지를 드롭하세요</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {previewUrl && (
            <motion.div
              layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="relative mb-3 m-w-full">
              <img src={previewUrl} alt="미리보기" className="max-h-32 rounded-lg border border-neutral-600" />
              <button type="button" onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white ring-2 ring-neutral-800 transition-transform hover:scale-110"
                aria-label="이미지 제거">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex w-full items-end gap-2">
          <TextareaAutosize
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none sm:text-md"
            rows={1}
            maxRows={8}
            disabled={disabled}
          />
          <div className="flex flex-shrink-0 items-center gap-2">
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} disabled={disabled}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700/60 text-neutral-300 transition-colors hover:bg-neutral-700">
              <Plus size={20} />
            </button>
            
            {/* 전송/중단 버튼 */}
            <button
              // disabled(isLoading) 상태일 때는 'button' 타입으로 변경하여 form 제출을 막음
              type={disabled ? 'button' : 'submit'}
              // disabled(isLoading) 상태일 때 onStop 함수 호출
              onClick={disabled ? onStop : undefined}
              // disabled가 아닐 때(전송 가능 상태일 때)만 내용이 없으면 비활성화
              disabled={!disabled && !value.trim() && !uploadedImage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed"
              // disabled(isLoading) 상태에 따라 aria-label 변경
              aria-label={disabled ? "생성 중단" : "전송"}
            >
              {/* disabled(isLoading) 상태에 따라 아이콘 변경 */}
              {disabled ? <Square size={18} /> : <ArrowUp size={20} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-3 right-0 grid grid-cols-4 gap-3 rounded-xl border border-neutral-700 bg-neutral-800 p-3 shadow-xl">
            <button type="button" onClick={handleImageIconClick}
              className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-700" title="이미지 첨부">
              <ImageIcon size={24} />
            </button>
            {menuIcons.map((item, index) => (
              <button key={index} type="button" onClick={() => { item.action(); setIsMenuOpen(false); }}
                className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-700" title={item.label}>
                <item.icon size={24} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} disabled={disabled} />
    </form>
  );
}