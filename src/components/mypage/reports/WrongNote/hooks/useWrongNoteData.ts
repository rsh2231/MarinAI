import { useMemo } from "react";
import { WrongNote } from "@/types/wrongNote";
import { WrongNoteFilters, FilterOptions } from "../types";
import { processWrongNote, ProcessedWrongNote } from "../utils/imageProcessor";

export const useWrongNoteData = (allNotes: WrongNote[], filters: WrongNoteFilters) => {
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

  // 연계 필터 옵션들 생성
  const filterOptions = useMemo((): FilterOptions => {
    // 전체 데이터에서 사용 가능한 자격증, 급수, 과목 추출
    const allLicenses = [...new Set(allNotes.map(note => note.gichul_qna?.gichulset?.type).filter(Boolean))] as string[];
    const allGrades = [...new Set(allNotes.map(note => note.gichul_qna?.gichulset?.grade).filter(Boolean))] as string[];
    const allSubjects = [...new Set(allNotes.map(note => note.gichul_qna?.subject).filter(Boolean))] as string[];

    // 선택된 자격증에 따른 사용 가능한 급수
    const availableGrades = filters.license 
      ? allGrades.filter(grade => {
          // 선택된 자격증의 데이터가 있는 급수만 필터링
          return allNotes.some(note => 
            note.gichul_qna?.gichulset?.type === filters.license && 
            note.gichul_qna?.gichulset?.grade === grade
          );
        })
      : allGrades;

    // 선택된 자격증과 급수에 따른 사용 가능한 과목
    const availableSubjects = filters.license && filters.grade
      ? allSubjects.filter(subject => {
          // 선택된 자격증과 급수의 데이터가 있는 과목만 필터링
          return allNotes.some(note => 
            note.gichul_qna?.gichulset?.type === filters.license && 
            note.gichul_qna?.gichulset?.grade === filters.grade &&
            note.gichul_qna?.subject === subject
          );
        })
      : filters.license
      ? allSubjects.filter(subject => {
          // 선택된 자격증의 데이터가 있는 과목만 필터링
          return allNotes.some(note => 
            note.gichul_qna?.gichulset?.type === filters.license && 
            note.gichul_qna?.subject === subject
          );
        })
      : allSubjects;

    return {
      subjects: availableSubjects.sort(),
      licenses: allLicenses.sort(),
      grades: availableGrades.sort(),
    };
  }, [allNotes, filters.license, filters.grade]);

  return {
    filteredNotes,
    groupedAndSortedNotes,
    filterOptions,
    processWrongNote,
  };
}; 