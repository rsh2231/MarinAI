"use client";

import { motion } from "framer-motion";
import { useChatForm } from "@/hooks/useChatForm";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatForm() {
  const {
    input,
    setInput,
    uploadedImage,
    setUploadedImage,
    isSubmitting,
    handleSubmit,
  } = useChatForm();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="w-full"
    >
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onImageUpload={setUploadedImage}
        uploadedImage={uploadedImage}
        disabled={isSubmitting}
      />
    </motion.div>
  );
}
