'use client';

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { BookX, ChevronUp, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { useWrongNotes } from "@/hooks/useWrongNotes";
import { WrongNoteItem } from "./WrongNoteItem";
import RetryWrongNoteModal from "./RetryWrongNoteModal";
import { WrongNoteFilterControls } from "./components/WrongNoteFilters";
import { WrongNoteViewProps, WrongNoteFilters as WrongNoteFiltersType } from "./types";
import { useWrongNoteData } from "./hooks/useWrongNoteData";

export default function WrongNoteView({ setWrongNotes }: WrongNoteViewProps) {
  const { allNotes, loading, error, deletingNoteIds, deleteFeedback, fetchWrongNotes, deleteNote, clearDeleteFeedback } = useWrongNotes();
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [filters, setFilters] = useState<WrongNoteFiltersType>({
    subject: "",
    license: "",
    grade: "",
  });

  useEffect(() => {
    fetchWrongNotes();
  }, [fetchWrongNotes]);

  useEffect(() => {
    if (setWrongNotes) {
      setWrongNotes(allNotes);
    }
  }, [allNotes, setWrongNotes]);

  const { filteredNotes, filterOptions } = useWrongNoteData(allNotes, filters);

  const displayNotes = showAll ? filteredNotes : filteredNotes.slice(0, 4);

  const handleFilterChange = (filterName: keyof WrongNoteFiltersType, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const toggleNoteOpen = (noteId: number) => {
    setOpenNoteIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (loading) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-400">오답노트를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <RetryWrongNoteModal
        isOpen={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        wrongNotes={filteredNotes}
      />
      
      {deleteFeedback && deleteFeedback.type === 'error' && (
        <div className="mb-4 p-3 rounded-md flex items-center justify-between bg-red-600/20 border border-red-500/50 text-red-300">
          <span className="flex items-center gap-2">
            <span className="text-red-400">✗</span>
            {deleteFeedback.message}
          </span>
          <button
            onClick={clearDeleteFeedback}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 w-full">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <BookX size={20} className="sm:w-6 sm:h-6" />
          최근 오답노트
        </h3>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
          <Button
            variant="primary"
            className="h-9 px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0"
            onClick={() => setRetryModalOpen(true)}
          >
            오답 다시 풀기
          </Button>
          <WrongNoteFilterControls
            filters={filterOptions}
            selectedValues={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-neutral-400">해당 조건의 오답노트가 없습니다.</p>
      ) : (
        <AnimatePresence mode="popLayout">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
            {displayNotes.map((note, index) => (
              <WrongNoteItem
                key={note.id}
                note={note}
                isOpen={openNoteIds.includes(note.id)}
                isDeleting={deletingNoteIds.includes(note.id)}
                onToggle={() => toggleNoteOpen(note.id)}
                onDelete={() => deleteNote(note.id)}
                index={index}
              />
            ))}
          </ul>
        </AnimatePresence>
      )}

      {filteredNotes.length > 4 && (
        <div className="flex justify-end mt-4">
          <button
            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 px-2 sm:px-3 py-2 rounded transition-all"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "닫기" : "전체 오답노트 보기"}
            {showAll ? <ChevronUp size={14} className="sm:w-4 sm:h-4" /> : <ChevronDown size={14} className="sm:w-4 sm:h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
