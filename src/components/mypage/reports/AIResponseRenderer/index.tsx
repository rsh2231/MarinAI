// /components/AIResponseRenderer/index.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIResponseParser } from "./useAIResponseParser";
import { containerVariants } from "./constants";
import {
  TypingIndicator,
  Introduction,
  ResponseSection,
} from "./subcomponents";

interface AIResponseRendererProps {
  message: string;
  isStreaming?: boolean;
}

export default function AIResponseRenderer({
  message,
  isStreaming = false,
}: AIResponseRendererProps) {
  const { introduction, sections, isProcessing } = useAIResponseParser({
    message,
    isStreaming,
  });

  const hasContent = introduction || sections.length > 0;

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
      <AnimatePresence>{isStreaming}</AnimatePresence>

      {introduction && <Introduction text={introduction} />}

      <div className="space-y-8">
        {sections.map((section, index) => (
          <ResponseSection
            key={`${index}-${section.title}`}
            section={section}
          />
        ))}
      </div>

      <AnimatePresence>
        {isProcessing && !isStreaming && <TypingIndicator />}
      </AnimatePresence>
    </motion.div>
  );
}
