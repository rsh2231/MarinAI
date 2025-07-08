"use client";

import React, {
  useRef,
  useState,
  useEffect,
  DragEvent,
} from "react";
import { Send, Image, X } from "lucide-react";
import Button from "../ui/Button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onImageUpload: (file: File | null) => void;
  uploadedImage: File | null; // 🔹 외부 상태를 prop으로 받음
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

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
    <form
      onSubmit={onSubmit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex flex-col gap-2"
    >
      {previewUrl && (
        <div className="relative w-fit max-w-xs">
          <img
            src={previewUrl}
            alt="미리보기"
            className="rounded border border-gray-600 max-h-[150px]"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
          ref={fileInputRef}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded border border-dashed border-gray-500 hover:border-primary"
          title="이미지를 업로드하거나 드래그 앤 드롭하세요"
        >
          <Image size={20} />
        </button>

        <textarea
          ref={textareaRef as any}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="질문을 입력하세요..."
          className="flex-grow p-2 rounded border border-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          disabled={disabled}
          required={!uploadedImage}
        />

        <Button type="submit" variant="neutral" disabled={disabled}>
          <Send size={20} />
        </Button>
      </div>
    </form>
  );
}
