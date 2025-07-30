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
  // gichul_qna가 없는 경우만 렌더링하지 않음
  if (!note.gichul_qna) return null;

  const q = note.gichul_qna;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return; // 삭제 중일 때는 클릭 무시
    
    if (window.confirm('정말로 이 오답노트를 삭제하시겠습니까?\n삭제된 오답노트는 복구할 수 없습니다.')) {
      onDelete();
    }
  };
  
  return (
    <li className="flex flex-col bg-neutral-700/70 rounded-md p-0">
      <div
        className="w-full flex justify-between items-center p-3 text-left focus:outline-none cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm sm:text-base truncate">{q.subject} - {q.qnum}번 문제</p>
          <div className="text-xs text-neutral-400 mt-1 flex flex-wrap gap-1.5">
            {/* 연도 */}
            {q.gichulset?.year && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-purple-500/30 hover:to-purple-600/30`}>
                {q.gichulset.year}년
              </span>
            )}
            {/* 자격증 */}
            {q.gichulset?.type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-blue-500/30 hover:to-blue-600/30`}>
                {q.gichulset.type}
              </span>
            )}
            {/* 급수 */}
            {q.gichulset?.grade && q.gichulset.type !== "소형선박조종사" && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-green-500/30 hover:to-green-600/30`}>
                {q.gichulset.grade}급
              </span>
            )}
            {/* 회차 */}
            {q.gichulset?.inning && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-orange-500/30 hover:to-orange-600/30`}>
                {q.gichulset.inning}회차
              </span>
            )}
            {/* 시도 횟수 */}
            {note.attempt_count && note.attempt_count > 1 && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30 backdrop-blur-sm shadow-sm transition-all duration-200 hover:from-red-500/30 hover:to-red-600/30`}>
                {note.attempt_count}회 시도
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            className={`text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded transition-all border flex items-center gap-1 sm:gap-1.5 ${
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
          <ChevronRight size={16} className={`text-neutral-500 transition-transform sm:w-5 sm:h-5 ${isOpen ? "rotate-90" : ""}`} />
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