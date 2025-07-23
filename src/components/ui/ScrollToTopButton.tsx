"use client";

import { useEffect, useState, RefObject } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";

interface ScrollToTopButtonProps {
  scrollableRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export default function ScrollToTopButton({
  scrollableRef,
  className = "",
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (scrollableRef) {
      const scrollableElement = scrollableRef.current;
      if (!scrollableElement) return;
      const handleScroll = () => {
        setVisible(scrollableElement.scrollTop > 100);
      };
      scrollableElement.addEventListener("scroll", handleScroll);
      return () => scrollableElement.removeEventListener("scroll", handleScroll);
    } else {
      const handleScroll = () => {
        setVisible(window.scrollY > 100);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [scrollableRef]);

  const scrollToTop = () => {
    if (scrollableRef && scrollableRef.current) {
      scrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  const baseClass =
    className && className.trim().length > 0
      ? className
      : "fixed bottom-6 right-6 lg:right-75 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all duration-200 z-40 backdrop-blur-sm bg-opacity-90";

  return (
    <motion.button
      onClick={scrollToTop}
      className={baseClass}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaArrowUp className="text-sm" />
    </motion.button>
  );
}
