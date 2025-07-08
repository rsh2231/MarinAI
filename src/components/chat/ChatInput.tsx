"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Plus, 
  ArrowUp, 
  Paperclip, 
  Mic, 
  FileText, 
  Image as ImageIcon 
} from "lucide-react";

// 팝업 메뉴 아이콘 데이터
const menuIcons = [
  { icon: Paperclip, label: "파일" },
  { icon: Mic, label: "음성" },
  { icon: FileText, label: "템플릿" },
];

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onImageUpload: (file: File | null) => void;
  uploadedImage: File | null;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  textareaRef,
  onImageUpload,
  uploadedImage,
}: ChatInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 부모로부터 받은 uploadedImage가 변경될 때 미리보기 URL을 생성/해제
  useEffect(() => {
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [uploadedImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    onImageUpload(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // 부모의 onSubmit을 직접 호출
      onSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full" // Home.tsx와 동일한 구조
    >
      {/* 입력창 전체 컨테이너 */}
      <div className="flex w-full gap-3 rounded-2xl border border-neutral-700 bg-neutral-800/50 p-3 shadow-lg backdrop-blur-sm">
        {/* 왼쪽 영역 (미리보기 + 입력창) */}
        <div className="flex flex-grow flex-col gap-3">
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative w-fit"
              >
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="max-h-32 rounded-lg border border-neutral-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white ring-2 ring-neutral-800 transition-transform hover:scale-110"
                  aria-label="이미지 제거"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef as any}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요..."
            className="w-full flex-grow resize-none bg-transparent text-lg text-neutral-200 placeholder-neutral-500 focus:outline-none"
            rows={1}
            disabled={disabled}
            required={!uploadedImage} // 이미지가 없으면 텍스트는 필수
          />
        </div>
        
        {/* 오른쪽 버튼 영역 */}
        <div className="flex flex-shrink-0 flex-col justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700/60 text-neutral-300 transition-colors hover:bg-neutral-700"
            aria-label="첨부 파일 메뉴 열기"
            disabled={disabled}
          >
            <Plus size={20} />
          </button>
          <button
            type="submit"
            disabled={disabled || (!value.trim() && !uploadedImage)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed"
            aria-label="전송"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
      
      {/* 팝업 메뉴 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-20 right-2 grid grid-cols-4 gap-3 rounded-xl border border-neutral-700 bg-neutral-800 p-3 shadow-xl"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-700"
              title="이미지 첨부"
            >
              <ImageIcon size={24} />
            </button>
            {menuIcons.map((item, index) => (
              <button
                key={index}
                type="button"
                className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-700"
                title={item.label}
              >
                <item.icon size={24} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 파일 입력을 위한 숨겨진 태그 */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageChange}
        disabled={disabled}
      />
    </form>
  );
}