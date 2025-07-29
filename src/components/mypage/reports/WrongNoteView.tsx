// 오답노트
"use client";
import { useState } from "react";
import {
  BookX,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { QuestionResultCard } from "@/components/problem/result/QuestionResultCard";
import { WrongNoteSet, WrongNote } from "@/types/wrongNote";
import { getWrongNotesFromServer } from "@/lib/wrongNoteApi";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { useEffect, useCallback } from "react";
import { deleteWrongNoteFromServer } from "@/lib/wrongNoteApi";
import RetryWrongNoteModal from "./RetryWrongNoteModal";

export default function WrongNoteView({ setWrongNotes }: { setWrongNotes?: (notes: any) => void }) {
  const auth = useAtomValue(authAtom);
  const [noteSets, setNoteSets] = useState<WrongNoteSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingNoteIds, setDeletingNoteIds] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLicense, setSelectedLicense] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);
  const [retryModalOpen, setRetryModalOpen] = useState(false);

  const fetchWrongNotes = useCallback(async () => {
    if (!auth.token || !auth.isLoggedIn) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const serverNoteSets: WrongNoteSet[] = await getWrongNotesFromServer(auth.token);
      
      // 안전한 데이터 검증
      const validatedNoteSets = Array.isArray(serverNoteSets) 
        ? serverNoteSets.filter(set => set && typeof set === 'object' && Array.isArray(set.results))
        : [];
      
      setNoteSets(validatedNoteSets);
    } catch (err) {
      console.error("오답노트 로딩 실패:", err);
      setError(err instanceof Error ? err.message : "오답노트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [auth.token, auth.isLoggedIn]);

  useEffect(() => {
    fetchWrongNotes();
  }, [fetchWrongNotes]);

  useEffect(() => {
    if (setWrongNotes) {
      setWrongNotes(noteSets);
    }
  }, [noteSets, setWrongNotes]);

  // 모든 results를 flat하게 합침 (안전한 필터링 추가)
  const notes: WrongNote[] = noteSets
    .filter(set => set && set.results && Array.isArray(set.results))
    .flatMap(set => set.results.filter(note => note && typeof note === 'object')); // 모든 노트 포함

  // 과목 목록 추출 (중복 제거) - 더 안전한 접근
  const subjects = Array.from(
    new Set(
      notes
        .filter(note => note && note.gichul_qna && note.gichul_qna.subject)
        .map((note) => note.gichul_qna!.subject) // non-null assertion 사용
    )
  );

  // 자격증 목록 추출 (중복 제거)
  const licenses = Array.from(
    new Set(
      notes
        .filter(note => note && note.gichul_qna && note.gichul_qna.gichulset && note.gichul_qna.gichulset.type)
        .map((note) => note.gichul_qna!.gichulset!.type)
    )
  );

  // 급수 목록 추출 (중복 제거)
  const grades = Array.from(
    new Set(
      notes
        .filter(note => note && note.gichul_qna && note.gichul_qna.gichulset && note.gichul_qna.gichulset.grade && note.gichul_qna.gichulset.type !== "소형선박조종사")
        .map((note) => note.gichul_qna!.gichulset!.grade)
    )
  ).sort((a, b) => parseInt(a) - parseInt(b)); // 숫자 순으로 정렬

  // 필터링된 오답노트 (gichul_qna가 있는 노트만 포함)
  const filteredNotes = notes.filter((note) => {
    if (!note.gichul_qna) return false;
    
    const subjectMatch = selectedSubject === "all" || note.gichul_qna.subject === selectedSubject;
    const licenseMatch = selectedLicense === "all" || note.gichul_qna.gichulset?.type === selectedLicense;
    const gradeMatch = selectedGrade === "all" || note.gichul_qna.gichulset?.grade === selectedGrade;
    
    return subjectMatch && licenseMatch && gradeMatch;
  });
  // recent, rest 분리 대신
  const displayNotes = showAll ? filteredNotes : filteredNotes.slice(0, 4);

  if (loading) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <LoadingSpinner text="오답노트를 불러오는 중..." minHeight="200px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      {/* 오답 다시 풀기 모달 */}
      <RetryWrongNoteModal
        isOpen={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        wrongNotes={filteredNotes}
      />
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
          <select
            className="bg-neutral-700 text-white rounded px-3 py-2 text-xs sm:text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-full sm:w-auto min-w-[100px] sm:min-w-[110px]"
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
            style={{ height: "36px" }}
          >
            <option value="all">전체 자격증</option>
            {licenses.map((license) => (
              <option key={license} value={license}>
                {license}
              </option>
            ))}
          </select>
          <select
            className="bg-neutral-700 text-white rounded px-3 py-2 text-xs sm:text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-full sm:w-auto min-w-[100px] sm:min-w-[110px]"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{ height: "36px" }}
          >
            <option value="all">전체 급수</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}급
              </option>
            ))}
          </select>
          <select
            className="bg-neutral-700 text-white rounded px-3 py-2 text-xs sm:text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-full sm:w-auto min-w-[100px] sm:min-w-[110px]"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ height: "36px" }}
          >
            <option value="all">전체 과목</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filteredNotes.length === 0 ? (
        <p className="text-neutral-400">해당 과목의 오답노트가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {displayNotes.map((note) => {
            return (
              <li
                key={note.id}
                className="flex flex-col bg-neutral-700/70 rounded-md p-0"
              >
                <div
                  className="w-full flex justify-between items-center p-3 text-left focus:outline-none cursor-pointer"
                  onClick={() =>
                    setOpenNoteIds((prev) =>
                      prev.includes(note.id)
                        ? prev.filter((nid) => nid !== note.id)
                        : [...prev, note.id]
                    )
                  }
                >
                  <div>
                    <p className="font-semibold">
                      {note.gichul_qna?.subject || '알 수 없는 과목'} - {note.gichul_qna?.qnum || '?'}번 문제
                    </p>
                    <p className="text-xs text-neutral-400">
                      {note.gichul_qna?.gichulset?.type && (
                        <span className={`inline-block text-white px-2 py-1 rounded mr-2 ${
                          note.gichul_qna.gichulset.type === "기관사" ? "bg-blue-600" :
                          note.gichul_qna.gichulset.type === "항해사" ? "bg-indigo-600" :
                          note.gichul_qna.gichulset.type === "소형선박조종사" ? "bg-purple-600" :
                          "bg-gray-600"
                        }`}>
                          {note.gichul_qna.gichulset.type}
                        </span>
                      )}
                      {note.gichul_qna?.gichulset?.grade && note.gichul_qna.gichulset.type !== "소형선박조종사" && (
                        <span className={`inline-block text-white px-2 py-1 rounded ${
                          note.gichul_qna.gichulset.grade === "1" ? "bg-green-600" :
                          note.gichul_qna.gichulset.grade === "2" ? "bg-blue-500" :
                          note.gichul_qna.gichulset.grade === "3" ? "bg-yellow-600" :
                          note.gichul_qna.gichulset.grade === "4" ? "bg-orange-600" :
                          note.gichul_qna.gichulset.grade === "5" ? "bg-red-500" :
                          note.gichul_qna.gichulset.grade === "6" ? "bg-purple-600" :
                          "bg-gray-600"
                        }`}>
                          {note.gichul_qna.gichulset.grade}급
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={`text-xs font-bold px-2 py-1 rounded transition-all border flex items-center gap-1 ${
                        deletingNoteIds.includes(note.id)
                          ? 'text-neutral-400 border-neutral-400 cursor-not-allowed'
                          : 'text-red-400 hover:text-red-300 border-red-400'
                      }`}
                      disabled={deletingNoteIds.includes(note.id)}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('정말로 이 오답노트를 삭제하시겠습니까?')) return;
                        
                        try {
                          setDeletingNoteIds(prev => [...prev, note.id]);
                          console.log('삭제 시작:', note.id);
                          
                          // 로컬에서 즉시 삭제 처리
                          setNoteSets(prevSets => {
                            console.log('로컬 삭제 처리 시작, 현재 sets:', prevSets.length);
                            const updatedSets = prevSets.map(set => ({
                              ...set,
                              results: set.results.filter(n => n.id !== note.id)
                            })).filter(set => set.results.length > 0);
                            console.log('로컬 삭제 처리 완료, 업데이트된 sets:', updatedSets.length);
                            return updatedSets;
                          });
                          
                          // 서버에도 삭제 요청 (백그라운드에서)
                          if (auth.token) {
                            try {
                              await deleteWrongNoteFromServer(auth.token, note.id);
                              console.log('서버 삭제 성공');
                            } catch (serverErr) {
                              console.warn('서버 삭제 실패:', serverErr);
                              // 서버 실패는 무시하고 로컬 삭제만 유지
                            }
                          }
                        } catch (err) {
                          console.error('오답노트 삭제 실패:', err);
                          alert('오답노트 삭제에 실패했습니다.');
                        } finally {
                          setDeletingNoteIds(prev => prev.filter(id => id !== note.id));
                        }
                      }}
                    >
                      {deletingNoteIds.includes(note.id) ? (
                        <div className="flex items-center gap-1">
                          <LoadingSpinner size="sm" text="" minHeight="auto" />
                          <span>삭제 중...</span>
                        </div>
                      ) : (
                        '삭제'
                      )}
                    </button>
                    <ChevronRight
                      size={20}
                      className={`text-neutral-500 transition-transform ${
                        openNoteIds.includes(note.id) ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {openNoteIds.includes(note.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden px-4 pb-3 break-keep"
                    >
                      {note.gichul_qna ? (() => {
                        const q = note.gichul_qna;
                        return (
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
                            index={displayNotes.findIndex((n) => n.id === note.id)}
                          />
                        );
                      })() : (
                        <div className="p-4 text-center text-neutral-400">
                          문제 정보를 불러올 수 없습니다.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
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
