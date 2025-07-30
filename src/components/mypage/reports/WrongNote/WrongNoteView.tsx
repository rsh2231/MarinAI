"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookX, ChevronUp, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { WrongNote } from "@/types/wrongNote";
import { useWrongNotes } from "@/hooks/useWrongNotes";
import { WrongNoteItem } from "./WrongNoteItem";
import RetryWrongNoteModal from "./RetryWrongNoteModal";

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
  <div className="flex flex-wrap gap-2">
    {/* 과목 필터 */}
    <select
      value={selectedValues.subject}
      onChange={(e) => onFilterChange('subject', e.target.value)}
      className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-300 focus:outline-none focus:border-blue-500"
    >
      <option value="">전체 과목</option>
      {filters.subjects.map((subject) => (
        <option key={subject} value={subject}>{subject}</option>
      ))}
    </select>

    {/* 자격증 필터 */}
    <select
      value={selectedValues.license}
      onChange={(e) => onFilterChange('license', e.target.value)}
      className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-300 focus:outline-none focus:border-blue-500"
    >
      <option value="">전체 자격증</option>
      {filters.licenses.map((license) => (
        <option key={license} value={license}>{license}</option>
      ))}
    </select>

    {/* 급수 필터 */}
    <select
      value={selectedValues.grade}
      onChange={(e) => onFilterChange('grade', e.target.value)}
      className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-neutral-300 focus:outline-none focus:border-blue-500"
    >
      <option value="">전체 급수</option>
      {filters.grades.map((grade) => (
        <option key={grade} value={grade}>{grade}</option>
      ))}
    </select>
  </div>
);

interface WrongNoteViewProps {
  setWrongNotes?: (notes: WrongNote[]) => void;
}

export default function WrongNoteView({ setWrongNotes }: WrongNoteViewProps) {
  const { allNotes, loading, error, deletingNoteIds, deleteFeedback, fetchWrongNotes, deleteNote, clearDeleteFeedback } = useWrongNotes();
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    subject: "",
    license: "",
    grade: "",
  });

  // 필터링된 노트들
  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      const q = note.gichul_qna;
      if (!q) return false;

      const subjectMatch = !filters.subject || q.subject === filters.subject;
      const licenseMatch = !filters.license || q.gichulset?.type === filters.license;
      const gradeMatch = !filters.grade || q.gichulset?.grade === filters.grade;

      return subjectMatch && licenseMatch && gradeMatch;
    });
  }, [allNotes, filters]);

  // 시도 회수별로 그룹화하고 정렬
  const groupedAndSortedNotes = useMemo(() => {
    const groups: { [key: number]: WrongNote[] } = {};
    
    filteredNotes.forEach(note => {
      const attemptCount = note.attempt_count || 1;
      if (!groups[attemptCount]) {
        groups[attemptCount] = [];
      }
      groups[attemptCount].push(note);
    });

    return Object.entries(groups)
      .map(([attemptCount, notes]) => ({
        attemptCount: parseInt(attemptCount),
        notes: notes.sort((a, b) => (b.id || 0) - (a.id || 0)) // 최신순 정렬
      }))
      .sort((a, b) => b.attemptCount - a.attemptCount); // 시도 회수 높은 순
  }, [filteredNotes]);

  // 표시할 그룹 결정 (showAll이 false면 상위 2개만)
  const displayGroups = showAll ? groupedAndSortedNotes : groupedAndSortedNotes.slice(0, 2);

  // 필터 옵션들
  const filterOptions = useMemo(() => {
    const subjects = [...new Set(allNotes.map(note => note.gichul_qna?.subject).filter(Boolean))] as string[];
    const licenses = [...new Set(allNotes.map(note => note.gichul_qna?.gichulset?.type).filter(Boolean))] as string[];
    const grades = [...new Set(allNotes.map(note => note.gichul_qna?.gichulset?.grade).filter(Boolean))] as string[];

    return {
      subjects: subjects.sort(),
      licenses: licenses.sort(),
      grades: grades.sort(),
    };
  }, [allNotes]);

  const handleFilterChange = (filterName: 'subject' | 'license' | 'grade', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const toggleNoteOpen = (noteId: number) => {
    setOpenNoteIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <RetryWrongNoteModal
        isOpen={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        wrongNotes={filteredNotes}
      />
      
      {/* 삭제 에러 피드백 메시지 */}
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
        <div className="space-y-6">
          {displayGroups.map((group) => (
            <div key={group.attemptCount} className="space-y-3">
              {/* 시도 회수별 헤더 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    group.attemptCount >= 3 ? 'bg-red-500' : 
                    group.attemptCount === 2 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}></div>
                  <h4 className="text-sm font-bold text-neutral-300">
                    {group.attemptCount}회 시도 문제 ({group.notes.length}개)
                  </h4>
                </div>
                <div className="flex-1 h-px bg-neutral-600"></div>
              </div>
              
              {/* 해당 시도 회수의 노트들 */}
              <AnimatePresence mode="popLayout">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {group.notes.map((note, index) => (
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
            </div>
          ))}
        </div>
      )}

      {groupedAndSortedNotes.length > 2 && (
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