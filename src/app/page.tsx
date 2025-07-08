"use client";

import { useState, useRef, useEffect } from "react";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image"; // next/image는 NextImage로 임포트
import {
  X,
  Plus,
  ArrowUp,
  Paperclip,
  Mic,
  FileText,
  Image as ImageIcon // lucide-react의 Image는 ImageIcon으로 임포트
} from "lucide-react";

// 팝업 메뉴에 표시할 아이콘 데이터
const menuIcons = [
  { icon: Paperclip, label: "파일" },
  { icon: Mic, label: "음성" },
  { icon: FileText, label: "템플릿" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useAutoResizeTextarea(textareaRef, input);

  // 메모리 누수 방지를 위해 생성된 URL을 관리하는 useEffect
  useEffect(() => {
    // 컴포넌트가 언마운트될 때, 이전에 생성된 URL이 있다면 해제합니다.
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 이미지 파일 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // 기존 미리보기 URL이 있다면 먼저 해제합니다.
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    }
  };

  // 첨부된 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null); // URL 상태도 null로 설정 (useEffect에서 해제됨)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isSubmitting) return;

    setIsSubmitting(true);

    // 1. 이미지가 선택된 경우, 먼저 서버에 업로드합니다.
    let imageUrl = "";
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImage); // 'file'이라는 키로 이미지를 전송 (API와 일치해야 함)

        const res = await fetch("/api/upload", { // 이미지 업로드 API 엔드포인트
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          // 업로드 실패 시 사용자에게 알림
          const errorData = await res.json();
          throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
        }

        const data = await res.json();
        imageUrl = data.url; // 업로드 후 반환된 이미지 URL

      } catch (error) {
        console.error(error);
        // alert(error.message); // 실제 서비스에서는 toast 라이브러리 사용 추천
        setIsSubmitting(false);
        return; // 업로드 실패 시 함수 종료
      }
    }

    // 2. 쿼리 파라미터를 생성합니다.
    const params = new URLSearchParams();
    params.set("initialQuestion", input.trim());
    if (imageUrl) {
      params.set("imageUrl", imageUrl);
    }

    // 3. 생성된 쿼리 파라미터와 함께 /chat 페이지로 이동합니다.
    router.push(`/chat?${params.toString()}`);
  };

  // Enter 키로 제출하는 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative bg-neutral-900 px-4 sm:px-6 md:px-8">
      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 sm:mb-3 select-none"
        >
          Marin<span className="text-blue-500">AI</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="max-w-lg text-neutral-400 text-sm sm:text-base mb-8 sm:mb-12 leading-relaxed select-none break-keep"
        >
          해기사 시험 준비의 새로운 항해, MarinAI와 함께 스마트하게 준비하세요.
          궁금한 점을 질문하거나, 관련 이미지를 첨부하여 물어보세요.
        </motion.p>

        {/* 폼 UI */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="relative w-full"
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
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="무엇이든 물어보세요"
                className="w-full flex-grow resize-none bg-transparent text-lg text-neutral-200 placeholder-neutral-500 focus:outline-none"
                rows={1}
              />
            </div>

            {/* 오른쪽 버튼 영역 */}
            <div className="flex flex-shrink-0 justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700/60 text-neutral-300 transition-colors hover:bg-neutral-700"
                aria-label="첨부 파일 메뉴 열기"
              >
                <Plus size={20} />
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isSubmitting}
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
          />
        </motion.form>
      </div>
    </div>
  );
}