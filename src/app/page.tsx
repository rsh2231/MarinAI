"use client";

import { useState, useRef } from "react";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SendHorizontal, Image as ImageIcon, X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useAutoResizeTextarea(textareaRef, input);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEvents = (
    e: React.DragEvent<HTMLFormElement>,
    type: "enter" | "leave" | "drop"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "enter") setIsDragging(true);
    else if (type === "leave") setIsDragging(false);
    else {
      // drop
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        setSelectedImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    let imageUrl = "";

    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("image", selectedImage);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          imageUrl = data.url;
        } else {
          throw new Error("이미지 업로드에 실패했습니다.");
        }
      } catch (error) {
        console.error(error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }
    }

    const params = new URLSearchParams();
    params.set("initialQuestion", input.trim());
    if (imageUrl) params.set("imageUrl", imageUrl);
    router.push(`/chat?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative px-4 sm:px-6 md:px-8">
      {/* 배경 회전 이미지 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
          className="w-[80vw] h-[80vw] md:w-[400px] md:h-[400px]"
        >
          <Image
            src="/images/wheel.png"
            alt="Ship Wheel"
            fill
            style={{ objectFit: "contain" }}
            priority
            draggable={false}
          />
        </motion.div>
      </motion.div>

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

        <motion.form
          onSubmit={handleSubmit}
          onDragEnter={(e) => handleDragEvents(e, "enter")}
          onDragLeave={(e) => handleDragEvents(e, "leave")}
          onDrop={(e) => handleDragEvents(e, "drop")}
          onDragOver={(e) => e.preventDefault()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className={`w-full bg-black/30 backdrop-blur-sm border rounded-xl transition-colors duration-300 ${
            isDragging ? "border-blue-500" : "border-neutral-700"
          }`}
        >
          <div className="p-2 sm:p-3 space-y-3">
            <AnimatePresence>
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative w-fit max-w-xs overflow-hidden px-1 pt-1 sm:px-2 sm:pt-2"
                >
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="rounded-md border border-neutral-600 max-h-[120px] sm:max-h-[150px]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2 sm:gap-3 p-1 sm:p-0">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 self-stretch flex items-center justify-center rounded-lg hover:bg-neutral-700/70 text-neutral-400 hover:text-white transition-colors border-neutral-700"
                title="이미지 업로드"
              >
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="질문 또는 이미지..."
                className="flex-grow bg-transparent text-white placeholder-neutral-500 resize-none focus:outline-none text-sm sm:text-base max-h-[7rem] overflow-y-auto min-h-[3rem] leading-snug py-3"
                rows={1}
                required
              />

              <Button
                type="submit"
                variant="neutral"
                disabled={!input.trim() || isSubmitting}
                className="p-2 sm:p-2.5 self-stretch"
              >
                <SendHorizontal className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
