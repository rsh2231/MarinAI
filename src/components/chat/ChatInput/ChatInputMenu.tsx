import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Mic, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

interface ChatInputMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onImageIconClick: () => void;
}

const menuIcons = [
  { icon: Paperclip, label: "파일", action: () => toast.info("파일 기능은 준비 중입니다.") },
  { icon: Mic, label: "음성", action: () => toast.info("음성 기능은 준비 중입니다.") },
  { icon: FileText, label: "템플릿", action: () => toast.info("템플릿 기능은 준비 중입니다.") },
];

export default function ChatInputMenu({ isOpen, onClose, onImageIconClick }: ChatInputMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute bottom-full mb-3 right-0 grid grid-cols-4 gap-3 rounded-xl border border-neutral-700 bg-neutral-800 p-3 shadow-xl">
          <button type="button" onClick={onImageIconClick}
            className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-700" title="이미지 첨부">
            <ImageIcon size={24} />
          </button>
          {menuIcons.map((item, index) => (
            <button key={index} type="button" onClick={() => { item.action(); onClose(); }}
              className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-700" title={item.label}>
              <item.icon size={24} />
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 