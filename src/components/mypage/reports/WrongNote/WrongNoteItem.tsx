import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { QuestionResultCard } from "@/components/problem/result/QuestionResultCard";
import { WrongNoteItemProps } from "./types";
import { WrongNoteBadges } from "./components/WrongNoteBadges";
import { processWrongNote } from "./utils/imageProcessor";

export function WrongNoteItem({ note, isOpen, isDeleting, onToggle, onDelete, index }: WrongNoteItemProps) {
  
  if (!note.gichul_qna) return null;

  const processedNote = processWrongNote(note);

  if (!processedNote) return null;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return; // 삭제 중일 때는 클릭 무시
    
    if (window.confirm('정말로 이 오답노트를 삭제하시겠습니까?\n삭제된 오답노트는 복구할 수 없습니다.')) {
      onDelete();
    }
  };
  
  return (
    <motion.li 
      className="flex flex-col bg-neutral-700/70 rounded-md p-0"
      layout
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: isDeleting ? 0.5 : 1, 
        scale: isDeleting ? 0.98 : 1 
      }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ 
        duration: 0.2,
        ease: "easeInOut"
      }}
    >
      <div
        className={`w-full flex justify-between items-center p-3 text-left focus:outline-none ${
          isDeleting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        onClick={isDeleting ? undefined : onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm sm:text-base truncate">
            {processedNote.subjectName} - {processedNote.metadata.qnum}번 문제
          </p>
          <WrongNoteBadges
            year={processedNote.metadata.year}
            type={processedNote.metadata.type}
            grade={processedNote.metadata.grade}
            inning={processedNote.metadata.inning}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            className={`h-9 text-xs font-bold px-2 py-1.5 sm:px-3 rounded transition-all border flex items-center gap-1 sm:gap-1.5 ${
              isDeleting 
                ? 'text-neutral-400 border-neutral-400 cursor-not-allowed bg-neutral-600/30' 
                : 'text-red-400 hover:text-red-300 border-red-400 hover:bg-red-400/10 hover:border-red-300'
            }`}
            disabled={isDeleting}
            onClick={handleDeleteClick}
            title={isDeleting ? "삭제 중..." : "오답노트 삭제"}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" text="" minHeight="auto" />
                <span className="hidden sm:inline">삭제 중...</span>
                <span className="sm:hidden">삭제중</span>
              </>
            ) : (
              <>
                <span>삭제</span>
              </>
            )}
          </button>
          <ChevronRight 
            size={14} 
            className={`text-neutral-500 transition-transform sm:w-4 sm:h-4 ${
              isOpen ? "rotate-90" : ""
            }`} 
          />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && !isDeleting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-4 pb-3 break-keep"
          >
            <QuestionResultCard
              question={{
                id: processedNote.id,
                num: processedNote.metadata.qnum || processedNote.id,
                questionStr: processedNote.questionStr,
                choices: processedNote.choices,
                answer: processedNote.answer,
                explanation: processedNote.explanation,
                subjectName: processedNote.subjectName,
                isImageQuestion: processedNote.isImageQuestion,
                imageUrl: processedNote.imageUrl,
              }}
              userAnswer={note.choice}
              index={index}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}