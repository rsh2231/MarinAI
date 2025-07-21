import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Message } from "@/types/Message";

export function useChat(initialQuestion?: string, initialImageUrl?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const initialMessageSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 답변 생성을 중단하는 함수
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // fetch 요청 중단
      setIsLoading(false); // 즉시 중단 시 로딩 해제
    }
  };

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

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // 항상 FormData 사용
      const formData = new FormData();
      formData.append("question", messageContent.trim());
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
        signal,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API 요청에 실패했습니다.");
      }

      const data = await res.json();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: data.answer }
            : msg
        )
      );
      setIsLoading(false);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("답변 생성이 중단되었습니다.");
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId)
        );
        return;
      }

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
      setIsLoading(false);
    } finally {
      if (userMessage.image && imageFile) {
        URL.revokeObjectURL(userMessage.image);
      }
    }
  };

  // 초기 질문이 있을 경우 자동 전송
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
    stop,
  };
}
