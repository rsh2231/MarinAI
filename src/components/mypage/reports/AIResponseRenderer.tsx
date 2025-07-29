import React, { useState, useEffect, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { AlertTriangle, BookOpen, TrendingUp, CheckCircle, Sparkles, Loader2 } from "lucide-react";

interface AIResponseRendererProps {
  message: string;
  isStreaming?: boolean;
}

const sectionIcons: { [key: string]: React.ReactNode } = {
  "자주 틀리는": <AlertTriangle className="w-5 h-5 text-amber-400" />,
  "전반적인 학습 상태": <BookOpen className="w-5 h-5 text-sky-400" />,
  "보완이 필요한 영역": <TrendingUp className="w-5 h-5 text-emerald-400" />,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // cubic-bezier
    },
  },
};

const typingVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function AIResponseRenderer({
  message,
  isStreaming = false,
}: AIResponseRendererProps) {
  const [processedMessage, setProcessedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const lastMessageRef = useRef("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 스트리밍 메시지 처리
  useEffect(() => {
    if (message !== lastMessageRef.current) {
      setIsTyping(true);
      
      // 타이핑 효과를 위한 지연
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setProcessedMessage(message);
        setIsTyping(false);
        lastMessageRef.current = message;
      }, 100);
    }
  }, [message]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!processedMessage && !isStreaming) return null;

  // FastAPI 스트리밍 응답 정리
  let cleanMessage = processedMessage
    .replace(/^data:\s*/gm, "")
    .trim();

  // 도입부 메시지 분리
  let introductionMessage = '';
  let mainContent = cleanMessage;
  
  // "MarinAI는 ... 제공합니다." 형태의 도입부 메시지 감지
  const lines = cleanMessage.split('\n');
  const firstLine = lines[0].trim();
  
  if (firstLine.includes('MarinAI는') && firstLine.includes('제공합니다')) {
    introductionMessage = firstLine;
    mainContent = lines.slice(1).join('\n').trim();
  }
  
  const blocks = mainContent.split(/(?=^##\s)/m).filter(block => block.trim() !== "");

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 스트리밍 인디케이터 */}
      {isStreaming && (
        <motion.div
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20"
          variants={pulseVariants}
          animate="pulse"
        >
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-blue-300 font-medium">
              MarinAI가 분석 중입니다...
            </span>
          </div>
        </motion.div>
      )}

      {/* 도입부 메시지 */}
      {introductionMessage && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            ease: "easeOut"
          }}
          className="mb-6 pb-4 border-b border-gray-700/30"
        >
          <motion.p className="text-sm sm:text-base text-neutral-300 leading-relaxed text-center italic">
            {introductionMessage}
          </motion.p>
        </motion.div>
      )}

      {/* 메인 콘텐츠 */}
      <AnimatePresence mode="wait">
        {blocks.map((block, index) => {
          const trimmedBlock = block.trim();

          if (trimmedBlock.startsWith("## ")) {
            const lines = trimmedBlock.split('\n');
            const titleLine = lines[0].replace("## ", "").trim();
            const content = lines.slice(1).join('\n').trim();

            // 향상된 콘텐츠 분리 로직 - 중첩 리스트 및 독립 메시지 지원
            let contentItems: string[] = [];
            let independentMessage = '';
            
            // 마지막 줄의 독립적인 메시지 분리
            const contentLines = content.split('\n');
            const lastLine = contentLines[contentLines.length - 1].trim();
            
            // "MarinAI는 ... 지원합니다." 형태의 독립 메시지 감지
            if (lastLine.includes('MarinAI는') && lastLine.includes('지원합니다')) {
              independentMessage = lastLine;
              // 마지막 줄을 제외한 콘텐츠 처리
              const contentWithoutLastLine = contentLines.slice(0, -1).join('\n').trim();
              
              // 먼저 - 로 시작하는 항목들을 찾음
              const bulletItems = contentWithoutLastLine.split(/(?=- )/m);
              
              bulletItems.forEach(item => {
                const trimmedItem = item.trim();
                if (trimmedItem.length === 0) return;
                
                // 줄바꿈으로 구분된 서브 항목들도 처리
                const itemLines = trimmedItem.split('\n');
                let currentItem = '';
                
                itemLines.forEach(line => {
                  const trimmedLine = line.trim();
                  if (trimmedLine.length === 0) return;
                  
                  // 새로운 - 항목이 시작되는 경우
                  if (trimmedLine.startsWith('- ') && currentItem.length > 0) {
                    contentItems.push(currentItem);
                    currentItem = trimmedLine;
                  } else {
                    // 기존 항목에 추가
                    if (currentItem.length > 0) {
                      currentItem += ' ' + trimmedLine;
                    } else {
                      currentItem = trimmedLine;
                    }
                  }
                });
                
                if (currentItem.length > 0) {
                  contentItems.push(currentItem);
                }
              });
            } else {
              // 기존 로직: 마지막 줄이 독립 메시지가 아닌 경우
              const bulletItems = content.split(/(?=- )/m);
              
              bulletItems.forEach(item => {
                const trimmedItem = item.trim();
                if (trimmedItem.length === 0) return;
                
                // 줄바꿈으로 구분된 서브 항목들도 처리
                const itemLines = trimmedItem.split('\n');
                let currentItem = '';
                
                itemLines.forEach(line => {
                  const trimmedLine = line.trim();
                  if (trimmedLine.length === 0) return;
                  
                  // 새로운 - 항목이 시작되는 경우
                  if (trimmedLine.startsWith('- ') && currentItem.length > 0) {
                    contentItems.push(currentItem);
                    currentItem = trimmedLine;
                  } else {
                    // 기존 항목에 추가
                    if (currentItem.length > 0) {
                      currentItem += ' ' + trimmedLine;
                    } else {
                      currentItem = trimmedLine;
                    }
                  }
                });
                
                if (currentItem.length > 0) {
                  contentItems.push(currentItem);
                }
              });
            }
            
            // - 로 시작하지 않는 항목들도 처리
            if (contentItems.length === 0) {
              contentItems = content
                .split('\n')
                .map(item => item.trim())
                .filter(item => item.length > 0 && !item.startsWith('##'));
            }

            const IconKey = Object.keys(sectionIcons).find((key) =>
              titleLine.includes(key)
            );
            
            return (
              <motion.div 
                key={`${index}-${titleLine}`} 
                variants={itemVariants}
                className="space-y-2"
              >
                <motion.h3 
                  className="text-lg sm:text-xl font-bold flex items-center gap-3 text-neutral-100 mb-4"
                  variants={typingVariants}
                >
                  {IconKey ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {sectionIcons[IconKey]}
                    </motion.div>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                  {titleLine}
                </motion.h3>
                
                <div className="space-y-3">
                  {contentItems.length > 0 ? (
                    <AnimatePresence>
                      {contentItems.map((item, itemIndex) => {
                        const cleanItem = item.startsWith('- ') ? item.substring(2) : item;
                        const isSubtitle = /^\*\*.*\*\*:$/.test(cleanItem);
                        
                        return (
                          <motion.div 
                            key={`${itemIndex}-${cleanItem.substring(0, 20)}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.3,
                              delay: itemIndex * 0.05,
                              ease: "easeOut"
                            }}
                            className="flex items-start gap-3 group"
                          >
                            {!isSubtitle && (
                              <motion.span 
                                className="mt-[9px] flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                  duration: 0.2,
                                  delay: itemIndex * 0.05 + 0.1,
                                  ease: "easeOut"
                                }}
                              />
                            )}
                            <motion.p 
                              className={`text-sm sm:text-base text-neutral-300 leading-relaxed ${
                                isSubtitle ? 'font-semibold text-blue-300' : ''
                              } group-hover:text-neutral-200 transition-colors`}
                            >
                              {cleanItem}
                            </motion.p>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-neutral-400"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm italic">
                        내용을 분석 중입니다... (발견된 항목: {contentItems.length}개)
                      </span>
                    </motion.div>
                  )}
                </div>
                
                {/* 독립적인 메시지 표시 */}
                {independentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.3,
                      ease: "easeOut"
                    }}
                    className="mt-6 pt-4 border-t border-gray-700/30"
                  >
                    <motion.p className="text-sm sm:text-base text-neutral-300 leading-relaxed text-center italic">
                      {independentMessage}
                    </motion.p>
                  </motion.div>
                )}
              </motion.div>
            );
          }

          // 일반 문단 (도입부 등)
          return (
            <motion.p
              key={`paragraph-${index}`}
              variants={typingVariants}
              className="text-sm sm:text-base text-neutral-300 leading-relaxed"
            >
              {trimmedBlock}
            </motion.p>
          );
        })}
      </AnimatePresence>

      {/* 타이핑 인디케이터 */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center gap-2 text-neutral-400"
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
          <span className="text-sm">타이핑 중...</span>
        </motion.div>
      )}
    </motion.div>
  );
}