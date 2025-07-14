"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ChatInput from "@/components/chat/ChatInput";
import { toast } from "react-toastify";

export default function Home() {
  const [input, setInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedImage) || isSubmitting) return;

    setIsSubmitting(true);

    let imageUrl = "";
    if (uploadedImage) {
      try {
        const formData = new FormData();
        formData.append("file", uploadedImage);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
        }

        const data = await res.json();
        imageUrl = data.url;
      } catch (error) {
        console.error(error);
        toast.error((error as Error).message);
        setIsSubmitting(false);
        return;
      }
    }

    const params = new URLSearchParams();
    if (input.trim()) params.set("initialQuestion", input.trim());
    if (imageUrl) params.set("imageUrl", imageUrl);

    // 쿼리 파라미터가 하나라도 있어야 이동
    if (params.toString()) {
      router.push(`/chat?${params.toString()}`);
    } else {
      // 아무것도 입력/첨부하지 않은 경우 (버튼 비활성화로 거의 발생 안함)
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-6xl font-extrabold text-white mb-3 select-none"
      >
        Marin<span className="text-blue-500">AI</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-lg mx-auto text-neutral-400 text-base mb-12 leading-relaxed select-none break-keep"
      >
        해기사 시험 준비의 새로운 항해, <br />
        MarinAI와 함께 스마트하게 준비하세요.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full"
      >
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onImageUpload={setUploadedImage}
          uploadedImage={uploadedImage}
          disabled={isSubmitting}
        />
      </motion.div>
    </div>
  );
}
