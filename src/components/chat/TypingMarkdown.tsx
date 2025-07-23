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
  speed = 10,
}: TypingMarkdownProps) {
  const [displayedText, setDisplayedText] = useState("");
  const currentIndexRef = useRef(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 애니메이션 루프 함수
    const animate = () => {
      // 타이핑할 텍스트가 남아있는 한 애니메이션을 계속 진행합니다.
      if (currentIndexRef.current < content.length) {
        setDisplayedText(content.substring(0, currentIndexRef.current + 1));
        currentIndexRef.current++;
        timeoutIdRef.current = setTimeout(animate, speed);
      } else {
        // 타이핑이 완료되면, 최종 텍스트가 정확히 일치하도록 보정하고 타이머를 정리합니다.
        setDisplayedText(content); 
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
      }
    };

    // `content`가 업데이트될 때마다 기존 타이머를 멈추고 새로운 애니메이션을 시작(또는 이어감)합니다.
    // 이는 스트리밍 중 새로운 데이터가 들어올 때 자연스럽게 이어가기 위함입니다.
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    // 스트리밍이 끝났더라도 타이핑이 덜 끝났으면 계속 진행합니다.
    animate();

    // 컴포넌트 언마운트 시 최종 클린업
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };

  // `isStreaming`을 의존성 배열에서 제거합니다. 
  // 이제 이 prop은 오직 커서 표시 여부에만 영향을 주고, 애니메이션 로직 자체를 제어하지 않습니다.
  }, [content, speed]);


  // 커서(▋) 표시 로직:
  // 스트리밍 중이거나, 또는 스트리밍은 끝났지만 아직 타이핑 애니메이션이 진행 중일 때 커서를 표시합니다.
  const showCursor = isStreaming || displayedText.length < content.length;

  return (
    <div
      className="prose prose-sm prose-invert max-w-none 
      prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 
      prose-pre:bg-neutral-800 prose-pre:p-3 prose-pre:rounded-md text-sm md:text-md"
    >
      <Markdown remarkPlugins={[remarkGfm]}>
        {displayedText + (showCursor ? "▋" : "")}
      </Markdown>
    </div>
  );
}