'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, CircleQuestionMark } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import TypingMarkdown from './TypingMarkdown';
import Lottie from 'lottie-react';
import AI from '@/assets/animations/AI.json';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 lg:right-15 p-2 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90"
        aria-label="Toggle Chat"
      >
        <CircleQuestionMark className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-35 right-6 lg:right-15 w-80 h-[28rem] bg-slate-800 text-white rounded-lg shadow-2xl flex flex-col z-50 border border-slate-700"
          >
            <header className="bg-slate-700 text-white p-4 flex justify-between items-center rounded-t-lg">
              <h3 className="font-bold text-lg">MarinAI</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-600 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2 sm:gap-4 ${
                      isUser ? 'justify-end' : ''
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Lottie animationData={AI} />
                      </div>
                    )}
                    <div
                      className={`flex flex-col max-w-[80%] sm:max-w-[75%] ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                          isUser
                            ? 'bg-neutral-700 text-white rounded-br-none'
                            : 'bg-neutral-700 text-neutral-200 rounded-bl-none'
                        }`}
                      >
                        {m.content &&
                          (isUser ? (
                            <div className="prose prose-sm prose-invert max-w-none prose-p:my-0">
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {m.content}
                              </Markdown>
                            </div>
                          ) : (
                            <TypingMarkdown
                              content={m.content}
                              isStreaming={isLoading && i === messages.length - 1}
                            />
                          ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <footer className="p-4 bg-slate-800 border-t border-slate-700">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  disabled={isLoading}
                />
                <button type="submit" className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={isLoading}>
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
