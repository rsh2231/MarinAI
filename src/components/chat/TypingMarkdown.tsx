"use client";

import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TypingMarkdownProps {
  content: string;
  isStreaming: boolean;
  speed?: number;
}

export default function TypingMarkdown({
  content,
  isStreaming,
  speed = 25,
}: TypingMarkdownProps) {
  const [displayedText, setDisplayedText] = useState("");
  const currentIndexRef = useRef(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. 스트리밍이 끝나면, 진행 중인 타이머를 정리하고 최종 텍스트를 즉시 표시합니다.
    if (!isStreaming) {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      setDisplayedText(content);
      return;
    }

    // 2. 애니메이션 루프 함수: 스스로를 재귀적으로 호출합니다.
    const animate = () => {
      // content가 변경되어도 currentIndexRef는 유지되므로, 이어서 타이핑할 수 있습니다.
      if (currentIndexRef.current < content.length) {
        setDisplayedText(content.substring(0, currentIndexRef.current + 1));
        currentIndexRef.current++;
        timeoutIdRef.current = setTimeout(animate, speed);
      }
    };

    // 3. 진행 중인 타이머가 없다면 (즉, 멈춰있거나 새로 시작할 때) 애니메이션을 시작합니다.
    // content가 업데이트 될 때마다 기존 타이머를 멈추고 새 타이머로 교체하여
    // 최신 content를 기반으로 타이핑을 이어갑니다.
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    animate();

    // 4. 컴포넌트가 언마운트되거나, 의존성이 변경되기 전에 클린업을 실행합니다.
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };

  // 5. displayedText.length를 의존성 배열에서 제거합니다.
  // 오직 외부 prop이 변경될 때만 이 effect가 다시 실행됩니다.
  }, [content, isStreaming, speed]);

  return (
    <div
      className="prose prose-sm prose-invert max-w-none 
      prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 
      prose-pre:bg-neutral-800 prose-pre:p-3 prose-pre:rounded-md text-sm md:text-md"
    >
      <Markdown remarkPlugins={[remarkGfm]}>
        {displayedText + (isStreaming ? "▋" : "")}
      </Markdown>
    </div>
  );
}