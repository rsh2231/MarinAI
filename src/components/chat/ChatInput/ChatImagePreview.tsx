import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ChatImagePreviewProps {
  previewUrl: string | null;
  onRemove: () => void;
}

export default function ChatImagePreview({ previewUrl, onRemove }: ChatImagePreviewProps) {
  return (
    <div style={{ minHeight: previewUrl ? 96 : 0, transition: 'min-height 0.2s' }}>
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="relative mb-3 m-w-full">
            <img src={previewUrl} alt="미리보기" className="max-h-32 rounded-lg border border-neutral-600" />
            <button type="button" onClick={onRemove}
              className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white ring-2 ring-neutral-800 transition-transform hover:scale-110"
              aria-label="이미지 제거">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 