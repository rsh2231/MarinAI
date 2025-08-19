import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Message } from "@/types/Message";
import { useAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";

export function useChat(initialQuestion?: string, initialImageUrl?: string) {
  const [authState] = useAtom(authAtom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const initialMessageSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    messageContent: string,
    imageFile: File | null
  ) => {
    if (!messageContent.trim() && !imageFile) return;

    const questionText = messageContent.trim() || "";
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent.trim() || "",
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
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
      const formData = new FormData();
      formData.append("question", questionText);
      if (imageFile) formData.append("image", imageFile);

      const headers = new Headers();
      if (authState.token) {
        headers.append("Authorization", `Bearer ${authState.token}`);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
        signal,
        headers,
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
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
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

  useEffect(() => {
    if ((initialQuestion || initialImageUrl) && !initialMessageSent.current) {
      const sendInitialMessage = async () => {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: initialQuestion || "",
          image: initialImageUrl,
        };
        setMessages((prev) => [...prev, userMessage]);

        const assistantMessageId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          { id: assistantMessageId, role: "assistant", content: "" },
        ]);
        setIsLoading(true);

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const formData = new FormData();
        formData.append("question", initialQuestion || "");

        if (initialImageUrl) {
          try {
            const response = await fetch(initialImageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });
            formData.append("image", file);
          } catch (error) {
            console.error("이미지 변환 오류:", error);
          }
        }

        try {
          const headers = new Headers();
          if (authState.token) {
            headers.append("Authorization", `Bearer ${authState.token}`);
          }

          const res = await fetch("/api/chat", {
            method: "POST",
            body: formData,
            signal,
            headers,
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
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
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
        }
      };

      sendInitialMessage();
      initialMessageSent.current = true;
    }
  }, [initialQuestion, initialImageUrl, authState.token]);

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