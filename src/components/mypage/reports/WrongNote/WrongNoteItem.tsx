import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { QuestionResultCard } from "@/components/problem/result/QuestionResultCard";
import { WrongNote } from "@/types/wrongNote";

interface WrongNoteItemProps {
  note: WrongNote;
  isOpen: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
  index: number;
}

export function WrongNoteItem({ note, isOpen, isDeleting, onToggle, onDelete, index }: WrongNoteItemProps) {
  if (!note.gichul_qna) return null; // 렌더링할 데이터가 없으면 렌더링하지 않음

  const q = note.gichul_qna;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 오답노트를 삭제하시겠습니까?')) {
      onDelete();
    }
  };
  
  return (
    <li className="flex flex-col bg-neutral-700/70 rounded-md p-0">
      <div
        className="w-full flex justify-between items-center p-3 text-left focus:outline-none cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <p className="font-semibold">{q.subject} - {q.qnum}번 문제</p>
          <p className="text-xs text-neutral-400 mt-1">
            {q.gichulset?.type && (
              <span className={`inline-block text-white px-2 py-1 rounded mr-2 bg-blue-600`}>
                {q.gichulset.type}
              </span>
            )}
            {q.gichulset?.grade && q.gichulset.type !== "소형선박조종사" && (
              <span className={`inline-block text-white px-2 py-1 rounded bg-green-600`}>
                {q.gichulset.grade}급
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`text-xs font-bold px-2 py-1 rounded transition-all border flex items-center gap-1 ${
              isDeleting ? 'text-neutral-400 border-neutral-400 cursor-not-allowed' : 'text-red-400 hover:text-red-300 border-red-400'
            }`}
            disabled={isDeleting}
            onClick={handleDeleteClick}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" text="" minHeight="auto" />
                <span>삭제 중...</span>
              </>
            ) : '삭제'}
          </button>
          <ChevronRight size={20} className={`text-neutral-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-4 pb-3 break-keep"
          >
            <QuestionResultCard
              question={{
                id: q.id,
                num: q.qnum,
                questionStr: q.questionstr,
                choices: [
                  { label: "가", text: q.ex1str, isImage: false },
                  { label: "나", text: q.ex2str, isImage: false },
                  { label: "사", text: q.ex3str, isImage: false },
                  { label: "아", text: q.ex4str, isImage: false },
                ],
                answer: q.answer,
                explanation: q.explanation || "",
                subjectName: q.subject,
                isImageQuestion: false,
                imageUrl: undefined,
              }}
              userAnswer={note.choice}
              index={index}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}