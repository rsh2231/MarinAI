"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { sectionIcons } from "./constants";

// 파싱된 데이터 타입을 정의
export interface ParsedSection {
  title: string;
  icon: React.ReactNode;
  items: string[];
  conclusion?: string;
}

export interface ParsedAIResponse {
  introduction: string;
  sections: ParsedSection[];
  isProcessing: boolean;
}

// 훅의 props 타입
interface UseAIResponseParserProps {
  message: string;
  isStreaming: boolean;
}

export const useAIResponseParser = ({ message, isStreaming }: UseAIResponseParserProps): ParsedAIResponse => {
  const [processedMessage, setProcessedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const lastMessageRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (message !== lastMessageRef.current) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setProcessedMessage(message);
        setIsTyping(false);
        lastMessageRef.current = message;
      }, 100);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [message]);

  const parsedData = useMemo(() => {
    const cleanMessage = processedMessage.replace(/^data:\s*/gm, "").trim();
    if (!cleanMessage) {
      return { introduction: "", sections: [], isProcessing: isStreaming || isTyping };
    }

    let introduction = '';
    let mainContent = cleanMessage;

    const lines = cleanMessage.split('\n');
    const firstLine = lines[0]?.trim() || '';
    if (firstLine.includes('MarinAI는') && firstLine.includes('제공합니다')) {
      introduction = firstLine;
      mainContent = lines.slice(1).join('\n').trim();
    }

    const blocks = mainContent.split(/(?=^##\s)/m).filter(block => block.trim() !== "");

    const sections = blocks.map(block => {
      const blockLines = block.trim().split('\n');
      const title = blockLines[0].replace("## ", "").trim();
      const content = blockLines.slice(1).join('\n').trim();
      
      const IconKey = Object.keys(sectionIcons).find(key => title.includes(key));
      const icon = IconKey ? sectionIcons[IconKey] : <div className="w-5 h-5" />;

      let items: string[] = [];
      let conclusion: string | undefined;

      const contentLines = content.split('\n');
      const lastLine = contentLines[contentLines.length - 1]?.trim() || '';

      const contentToParse = (lastLine.includes('MarinAI는') && lastLine.includes('지원합니다'))
        ? contentLines.slice(0, -1).join('\n')
        : content;
      
      if (lastLine.includes('MarinAI는') && lastLine.includes('지원합니다')) {
        conclusion = lastLine;
      }

      items = contentToParse.split(/(?=- )/m)
        .map(item => item.trim().replace(/\n/g, ' ')) // 줄바꿈을 공백으로 병합
        .filter(Boolean);
      
      if (items.length === 0 && contentToParse.length > 0) {
        items = contentToParse.split('\n').filter(Boolean);
      }
      
      return { title, icon, items, conclusion };
    });

    return { introduction, sections, isProcessing: isStreaming || isTyping };
  }, [processedMessage, isStreaming, isTyping]);

  return parsedData;
};