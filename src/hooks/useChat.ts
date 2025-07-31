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
    imageFile: File | null
  ) => {
    // 텍스트와 이미지가 모두 없으면 전송하지 않음
    if (!messageContent.trim() && !imageFile) return;

    // 이미지만 있을 때는 빈 문자열 사용 (API에서 허용)
    const questionText = messageContent.trim() || "";
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent.trim() || "", // 빈 문자열 허용
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
      // 항상 FormData 사용
      const formData = new FormData();
      formData.append("question", questionText);
      // imageFile이 있을 때만 image 필드 추가
      if (imageFile) formData.append("image", imageFile);
      // initialImageUrl이 있을 때는 이미 서버에 업로드된 URL이므로 image 필드에 포함하지 않음
      // 대신 question에 이미지 URL 정보를 포함시킴

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

  // 초기 질문이 있을 경우 자동 전송
  useEffect(() => {
    if ((initialQuestion || initialImageUrl) && !initialMessageSent.current) {
      const sendInitialMessage = async () => {
        // 사용자 메시지 생성
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: initialQuestion || "",
          image: initialImageUrl,
        };
        setMessages((prev) => [...prev, userMessage]);

        // API 호출
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

        // initialImageUrl을 파일로 변환하여 전송
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
