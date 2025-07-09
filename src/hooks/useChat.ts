import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Message } from "@/types/Message";

export function useChat(initialQuestion?: string, initialImageUrl?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const initialMessageSent = useRef(false);

  const sendMessage = async (
    messageContent: string,
    imageFile: File | null,
    imageUrl?: string
  ) => {
    if (!messageContent.trim() && !imageFile && !imageUrl) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      image: imageFile ? URL.createObjectURL(imageFile) : imageUrl,
    };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);
    setIsLoading(true);
    setInput("");
    setUploadedImage(null);

    try {
      let res;
      // 새로 업로드한 파일이 있을 경우 FormData로 전송
      if (imageFile) {
        const formData = new FormData();
        formData.append("message", messageContent.trim());
        formData.append("image", imageFile);
        res = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });
      }
      // 파일 없이 텍스트와 URL만 있을 경우 JSON으로 전송
      else {
        // imageUrl이 존재하고, 상대 경로인 경우 절대 경로로 변환
        let absoluteImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith("/")) {
          absoluteImageUrl = new URL(imageUrl, window.location.origin).href;
        }

        // 이미지 URL을 포함하여 JSON으로 전송
        res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageContent.trim(),
            imageUrl: absoluteImageUrl,
          }),
        });
      }

      if (!res.ok || !res.body) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API 요청에 실패했습니다.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        accumulatedContent += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("전송 오류:", error);
      toast.error(
        (error as Error).message || "답변 생성 중 오류가 발생했습니다."
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "⚠️ 답변을 가져오지 못했습니다." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      // 생성된 임시 URL 해제 (imageFile이 있었던 경우에만)
      if (userMessage.image && imageFile) {
        URL.revokeObjectURL(userMessage.image);
      }
    }
  };

  useEffect(() => {
    if ((initialQuestion || initialImageUrl) && !initialMessageSent.current) {
      sendMessage(initialQuestion || "", null, initialImageUrl);
      initialMessageSent.current = true;
    }
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
