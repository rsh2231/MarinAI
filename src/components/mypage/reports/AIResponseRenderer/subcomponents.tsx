import React from "react";
import { motion } from "framer-motion";
import { itemVariants } from "./constants";
import type { ParsedSection } from "./useAIResponseParser";

// 에러 fallback 컴포넌트
export const ErrorFallback = ({ error }: { error: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
  >
    <div className="flex items-center gap-2 text-red-400 mb-2">
      <div className="w-4 h-4 bg-red-400 rounded-full" />
      <span className="text-sm font-medium">오류 발생</span>
    </div>
    <p className="text-sm text-red-300">{error}</p>
  </motion.div>
);

// 타이핑 인디케이터
export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="flex items-center gap-2 text-neutral-400"
  >
    <div className="flex gap-1">
      {[0, 200, 400].map(delay => (
        <div 
          key={delay} 
          className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" 
          style={{ animationDelay: `${delay}ms` }} 
        />
      ))}
    </div>
    <span className="text-sm">타이핑 중...</span>
  </motion.div>
);

// 도입부 메시지
export const Introduction = ({ text }: { text: string }) => (
  <motion.div
    variants={itemVariants}
    className="mb-6 pb-4 border-b border-gray-700/30"
  >
    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed text-center italic">
      {text}
    </p>
  </motion.div>
);

// 개별 리스트 아이템 - 메모이제이션으로 성능 최적화
const ResponseItem = React.memo(({ item, index }: { item: string; index: number }) => {
  const cleanItem = item.startsWith('- ') ? item.substring(2) : item;
  const isSubtitle = /^\*\*.*\*\*:$/.test(cleanItem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="flex items-start gap-3 group"
    >
      {!isSubtitle && (
        <span className="mt-[9px] flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full" />
      )}
      <p className={`text-sm sm:text-base text-neutral-300 leading-relaxed ${isSubtitle ? 'font-semibold text-blue-300' : ''} group-hover:text-neutral-200 transition-colors`}>
        {cleanItem}
      </p>
    </motion.div>
  );
});

ResponseItem.displayName = 'ResponseItem';

// 하나의 섹션 전체 - 메모이제이션으로 성능 최적화
export const ResponseSection = React.memo(({ 
  section, 
  sectionIndex 
}: { 
  section: ParsedSection; 
  sectionIndex: number;
}) => (
  <motion.div 
    variants={itemVariants} 
    className="space-y-2"
  >
    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-neutral-100 mb-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {section.icon}
      </motion.div>
      {section.title}
    </h3>
    
    <div className="space-y-3">
      {section.items.map((item, index) => (
        <ResponseItem 
          key={`item-${sectionIndex}-${index}-${item.substring(0, 20).replace(/\s+/g, '-')}`} 
          item={item} 
          index={index} 
        />
      ))}
    </div>

    {section.conclusion && (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        className="mt-6 pt-4 border-t border-gray-700/30"
      >
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed text-center italic">
          {section.conclusion}
        </p>
      </motion.div>
    )}
  </motion.div>
));

ResponseSection.displayName = 'ResponseSection';