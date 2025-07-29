"use client";

import { useState, useMemo, useEffect } from "react";
import { BookX, ChevronUp, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RetryWrongNoteModal from "./RetryWrongNoteModal";
import { WrongNoteItem } from "./WrongNoteItem";
import { useWrongNotes } from "@/hooks/useWrongNotes";
import type { WrongNote } from "@/types/wrongNote"; 

interface WrongNoteFiltersProps {
  filters: {
    subjects: string[];
    licenses: string[];
    grades: string[];
  };
  selectedValues: {
    subject: string;
    license: string;
    grade: string;
  };
  onFilterChange: (filterName: 'subject' | 'license' | 'grade', value: string) => void;
}

const WrongNoteFilters = ({ filters, selectedValues, onFilterChange }: WrongNoteFiltersProps) => (
  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">

    {/* 자격증 필터 */}
    <select
      className="bg-neutral-700 text-white rounded px-3 py-2 text-xs sm:text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-full sm:w-auto min-w-[100px] sm:min-w-[110px]"
      value={selectedValues.license}
      onChange={(e) => onFilterChange('license', e.target.value)}
      style={{ height: "36px" }}
    >
      <option value="all">전체 자격증</option>
      {filters.licenses.map((license) => <option key={license} value={license}>{license}</option>)}
    </select>

    {/* 급수 필터 */}
    <select
      className="bg-neutral-700 text-white rounded px-3 py-2 text-xs sm:text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-full sm:w-auto min-w-[100px] sm:min-w-[110px]"
      value={selectedValues.grade}
      onChange={(e) => onFilterChange('grade', e.target.value)}
      style={{ height: "36px" }}
    >
      <option value="all">전체 급수</option>
      {filters.grades.map((grade) => <option key={grade} value={grade}>{grade}급</option>)}
    </select>

    {/* 과목 필터 */}
    <select
      className="bg-neutral-700 text-white rounded px-3 py-2 text-xs sm:text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-full sm:w-auto min-w-[100px] sm:min-w-[110px]"
      value={selectedValues.subject}
      onChange={(e) => onFilterChange('subject', e.target.value)}
      style={{ height: "36px" }}
    >
      <option value="all">전체 과목</option>
      {filters.subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
    </select>
  </div>
);
interface WrongNoteViewProps {
  setWrongNotes?: (notes: WrongNote[]) => void;
}

export default function WrongNoteView({ setWrongNotes }: WrongNoteViewProps) {
  const { allNotes, loading, error, deletingNoteIds, deleteFeedback, fetchWrongNotes, deleteNote, clearDeleteFeedback } = useWrongNotes();

  const [filters, setFilters] = useState({ subject: "all", license: "all", grade: "all" });
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  
  useEffect(() => {
    fetchWrongNotes();
  }, [fetchWrongNotes]);

  useEffect(() => {
    if (setWrongNotes) {
      setWrongNotes(allNotes);
    }
  }, [allNotes, setWrongNotes]);
  
  const filterOptions = useMemo(() => {
    const notesWithData = allNotes.filter(note => note.gichul_qna);
    const subjects = Array.from(new Set(notesWithData.map(note => note.gichul_qna!.subject)));
    const licenses = Array.from(new Set(notesWithData.map(note => note.gichul_qna!.gichulset?.type).filter(Boolean))) as string[];
    const grades = Array.from(new Set(notesWithData.filter(n => n.gichul_qna!.gichulset?.type !== "소형선박조종사").map(note => note.gichul_qna!.gichulset?.grade).filter(Boolean))).sort((a, b) => parseInt(a!) - parseInt(b!)) as string[];
    return { subjects, licenses, grades };
  }, [allNotes]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const { gichul_qna } = note;
      if (!gichul_qna) return false;
      
      const subjectMatch = filters.subject === "all" || gichul_qna.subject === filters.subject;
      const licenseMatch = filters.license === "all" || gichul_qna.gichulset?.type === filters.license;
      const gradeMatch = filters.grade === "all" || gichul_qna.gichulset?.grade === filters.grade;
      
      return subjectMatch && licenseMatch && gradeMatch;
    });
  }, [allNotes, filters]);

  const displayNotes = showAll ? filteredNotes : filteredNotes.slice(0, 4);

  const handleFilterChange = (filterName: 'subject' | 'license' | 'grade', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const toggleNoteOpen = (noteId: number) => {
    setOpenNoteIds(prev => prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]);
  };

  if (loading) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookX size={22} />최근 오답노트</h3>
        <LoadingSpinner text="오답노트를 불러오는 중..." minHeight="200px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookX size={22} />최근 오답노트</h3>
        <p className="text-red-400">{error}</p>
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
      
      {/* 삭제 피드백 메시지 */}
      {deleteFeedback && (
        <div className={`mb-4 p-3 rounded-md flex items-center justify-between ${
          deleteFeedback.type === 'success' 
            ? 'bg-green-600/20 border border-green-500/50 text-green-300' 
            : 'bg-red-600/20 border border-red-500/50 text-red-300'
        }`}>
          <span className="flex items-center gap-2">
            {deleteFeedback.type === 'success' ? (
              <span className="text-green-400">✓</span>
            ) : (
              <span className="text-red-400">✗</span>
            )}
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
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 w-full">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0"
            onClick={() => setRetryModalOpen(true)}
          >
            오답 다시 풀기
          </Button>
          <WrongNoteFilters
            filters={filterOptions}
            selectedValues={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-neutral-400">해당 조건의 오답노트가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
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
      )}

      {filteredNotes.length > 4 && (
        <div className="flex justify-end mt-4">
          <button
            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 px-3 py-2 rounded transition-all"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "닫기" : "전체 오답노트 보기"}
            {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}