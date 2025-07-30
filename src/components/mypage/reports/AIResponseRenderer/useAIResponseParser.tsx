"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { sectionIcons, defaultIcon } from "./constants";

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
  error?: string;
}

// 훅의 props 타입
interface UseAIResponseParserProps {
  message: string;
  isStreaming: boolean;
}

// 안전한 문자열 파싱을 위한 유틸리티 함수들
const safeStringSplit = (str: string, delimiter: string | RegExp): string[] => {
  try {
    return str.split(delimiter).filter(Boolean);
  } catch {
    return [];
  }
};

const extractIntroduction = (message: string): { introduction: string; remainingContent: string } => {
  const lines = safeStringSplit(message, '\n');
  const firstLine = lines[0]?.trim() || '';
  
  if (firstLine.includes('MarinAI는') && firstLine.includes('제공합니다')) {
    return {
      introduction: firstLine,
      remainingContent: lines.slice(1).join('\n').trim()
    };
  }
  
  return { introduction: '', remainingContent: message };
};

const parseSection = (block: string): ParsedSection | null => {
  try {
    const lines = safeStringSplit(block.trim(), '\n');
    if (lines.length === 0) return null;

    const titleLine = lines[0];
    if (!titleLine.startsWith('## ')) return null;

    const title = titleLine.replace("## ", "").trim();
    const content = lines.slice(1).join('\n').trim();
    
    if (!title || !content) return null;

    // 아이콘 매칭
    const iconKey = Object.keys(sectionIcons).find(key => title.includes(key));
    const icon = iconKey ? sectionIcons[iconKey] : defaultIcon;

    // 콘텐츠 파싱
    const contentLines = safeStringSplit(content, '\n');
    const lastLine = contentLines[contentLines.length - 1]?.trim() || '';
    
    let items: string[] = [];
    let conclusion: string | undefined;

    // 결론 부분 분리
    const hasConclusion = lastLine.includes('MarinAI는') && lastLine.includes('지원합니다');
    const contentToParse = hasConclusion 
      ? contentLines.slice(0, -1).join('\n')
      : content;
    
    if (hasConclusion) {
      conclusion = lastLine;
    }

    // 아이템 파싱 - 더 견고한 로직
    if (contentToParse) {
      // 먼저 bullet point로 분리 시도
      const bulletItems = safeStringSplit(contentToParse, /(?=- )/m)
        .map(item => item.trim().replace(/\n/g, ' '))
        .filter(item => item.length > 0);

      if (bulletItems.length > 0) {
        items = bulletItems;
      } else {
        // bullet point가 없으면 줄 단위로 분리
        items = safeStringSplit(contentToParse, '\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }
    }

    return { title, icon, items, conclusion };
  } catch (error) {
    console.error('Section parsing error:', error);
    return null;
  }
};

export const useAIResponseParser = ({ message, isStreaming }: UseAIResponseParserProps): ParsedAIResponse => {
  const [processedMessage, setProcessedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const lastMessageRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 메시지 처리 함수
  const processMessage = useCallback((newMessage: string) => {
    try {
      setError(undefined);
      const cleanMessage = newMessage.replace(/^data:\s*/gm, "").trim();
      setProcessedMessage(cleanMessage);
      lastMessageRef.current = newMessage;
    } catch (err) {
      setError('메시지 처리 중 오류가 발생했습니다.');
      console.error('Message processing error:', err);
    }
  }, []);

  // 타이핑 상태 관리
  useEffect(() => {
    if (message !== lastMessageRef.current) {
      setIsTyping(true);
      
      // 기존 타이머 정리
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 새로운 타이머 설정
      typingTimeoutRef.current = setTimeout(() => {
        processMessage(message);
        setIsTyping(false);
      }, 150); // 약간 더 긴 지연시간으로 안정성 향상
    }

    // Cleanup 함수
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, processMessage]);

  // 파싱된 데이터 계산
  const parsedData = useMemo(() => {
    try {
      if (!processedMessage) {
        return { 
          introduction: "", 
          sections: [], 
          isProcessing: isStreaming || isTyping,
          error: undefined
        };
      }

      // 도입부 추출
      const { introduction, remainingContent } = extractIntroduction(processedMessage);

      // 섹션 파싱
      const sectionBlocks = safeStringSplit(remainingContent, /(?=^##\s)/m);
      const sections: ParsedSection[] = [];

      for (const block of sectionBlocks) {
        const section = parseSection(block);
        if (section) {
          sections.push(section);
        }
      }

      return { 
        introduction, 
        sections, 
        isProcessing: isStreaming || isTyping,
        error: undefined
      };
    } catch (err) {
      console.error('Parsing error:', err);
      return {
        introduction: "",
        sections: [],
        isProcessing: isStreaming || isTyping,
        error: '응답을 파싱하는 중 오류가 발생했습니다.'
      };
    }
  }, [processedMessage, isStreaming, isTyping]);

  return parsedData;
};