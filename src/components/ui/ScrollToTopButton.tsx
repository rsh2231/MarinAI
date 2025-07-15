"use client";

import { useEffect, useState, RefObject } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";
interface ScrollToTopButtonProps {
  scrollableRef: RefObject<HTMLElement | null>;
}

export default function ScrollToTopButton({
  scrollableRef,
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollableElement = scrollableRef.current;

    // ref.current가 아직 없을 수 있으므로, 방어 코드를 추가
    if (!scrollableElement) return;

    const handleScroll = () => {
      setVisible(scrollableElement.scrollTop > 300);
    };

    scrollableElement.addEventListener("scroll", handleScroll);

    // 컴포넌트 언마운트 시 이벤트 리스너를 제거
    return () => scrollableElement.removeEventListener("scroll", handleScroll);
  }, [scrollableRef]); // ref 객체가 변경될 경우를 대비해 dependency array에 추가

  const scrollToTop = () => {
    scrollableRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  if (!visible) return null;

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <FaArrowUp />
    </motion.button>
  );
}
