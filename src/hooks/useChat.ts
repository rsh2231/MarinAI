import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Message } from "@/types/Message";
import { count } from "console";
import { resolve } from "path";

export function useChat(initialQuestion?: string, initialImageUrl?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const initialMessageSent = useRef(false);

  const sendMessage = async (messageContent: string, imageFile: File | null, imageUrl?: string) => {
    if (!messageContent.trim() && !imageFile && !imageUrl) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      image: imageFile ? URL.createObjectURL(imageFile) : imageUrl,
    };
    setMessages(prev => [...prev, userMessage]);

    const assistantMessageId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);
    setIsLoading(true);
    setInput("");
    setUploadedImage(null);

    try {
      // fetch 로직 복원
      const formData = new FormData();
      formData.append("message", messageContent.trim());
      // 초기 메시지에는 imageFile이 없으므로, 사용자가 직접 올린 경우에만 추가
      if (imageFile) {
        formData.append("image", imageFile);
      }
      // 초기 이미지 URL이 있다면 별도 필드로 추가 (API 설계에 따라 변경 가능)
      if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!res.ok || !res.body) throw new Error("API 요청 실패");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        for (const char of chunk) {
          accumulatedContent += char;

          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
            )
          );
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
    } catch (error) {
      console.error("전송 오류:", error);
      toast.error("답변 생성 중 오류가 발생했습니다.");
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId ? { ...msg, content: "⚠️ 답변을 가져오지 못했습니다." } : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (userMessage.image && imageFile) {
        URL.revokeObjectURL(userMessage.image);
      }
    }
  };

  useEffect(() => {
    // 👇 initialQuestion이 있고, 아직 전송되지 않았을 때만 실행
    if (initialQuestion && !initialMessageSent.current) {
      sendMessage(initialQuestion, null, initialImageUrl);
      // 👇 전송되었음을 표시
      initialMessageSent.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, initialImageUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, uploadedImage);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    uploadedImage,
    setUploadedImage,
    handleSubmit,
  };
}