"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/ImageUpload";

export function useChatForm() {
  const [input, setInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedImage) || isSubmitting) return;

    setIsSubmitting(true);

    let imageUrl: string | null = null;
    if (uploadedImage) {
      imageUrl = await uploadImage(uploadedImage);
      if (!imageUrl) { // 업로드 실패 시
        setIsSubmitting(false);
        return;
      }
    }
    
    const params = new URLSearchParams();
    if (input.trim()) params.set("initialQuestion", input.trim());
    if (imageUrl) params.set("imageUrl", imageUrl);

    if (params.toString()) {
      router.push(`/chat?${params.toString()}`);
    } else {
      setIsSubmitting(false);
    }
  };

  return {
    input,
    setInput,
    uploadedImage,
    setUploadedImage,
    isSubmitting,
    handleSubmit,
  };
}