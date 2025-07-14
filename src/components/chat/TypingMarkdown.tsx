"use client";

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TypingMarkdownProps {
  content: string;
  isStreaming: boolean;
}

export default function TypingMarkdown({
  content,
  isStreaming,
}: TypingMarkdownProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(content);
      return;
    }

    let i = 0;
    setDisplayed("");

    const timer = setInterval(() => {
      setDisplayed((prev) => prev + content[i]);
      i++;
      if (i >= content.length) clearInterval(timer);
    }, 20); // 속도 조절 가능 (ms)

    return () => clearInterval(timer);
  }, [content, isStreaming]);

  return (
    <div
      className="prose prose-sm prose-invert max-w-none 
  prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 
  prose-pre:bg-neutral-800 prose-pre:p-3 prose-pre:rounded-md text-sm md:text-md"
    >
      <Markdown remarkPlugins={[remarkGfm]}>
        {displayed + (isStreaming ? "▋" : "")}
      </Markdown>
    </div>
  );
}
