// /components/AIResponseRenderer/index.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIResponseParser } from "./useAIResponseParser";
import { containerVariants } from "./constants";
import {
  TypingIndicator,
  Introduction,
  ResponseSection,
  ErrorFallback,
} from "./subcomponents";

interface AIResponseRendererProps {
  message: string;
  isStreaming?: boolean;
}

export default function AIResponseRenderer({
  message,
  isStreaming = false,
}: AIResponseRendererProps) {
  const { introduction, sections, isProcessing, error } = useAIResponseParser({
    message,
    isStreaming,
  });

  const hasContent = introduction || sections.length > 0;

  // 에러가 있거나 컨텐츠가 없고 스트리밍도 아닌 경우
  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!hasContent && !isStreaming) {
    return null;
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {isStreaming && <TypingIndicator key="typing" />}
      </AnimatePresence>

      {introduction && <Introduction text={introduction} />}

      <div className="space-y-8">
        {sections.map((section, index) => (
          <ResponseSection
            key={`section-${index}-${section.title.replace(/\s+/g, '-')}`}
            section={section}
            sectionIndex={index}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isProcessing && !isStreaming && (
          <TypingIndicator key="processing" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
