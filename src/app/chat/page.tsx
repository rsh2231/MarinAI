"use client";

import ChatBox from "@/components/ui/ChatBox";
import { motion } from "framer-motion";

export default function ChatPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-4 max-w-2xl mx-auto">
      <ChatBox/>
    </motion.div>
  );
}
