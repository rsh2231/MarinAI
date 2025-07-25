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
import { QuestionResultCard } from "@/components/problem/result/QuestionResultCard";
import { WrongNoteSet, WrongNote } from "@/types/wrongNote";
import { getWrongNotesFromServer } from "@/lib/wrongNoteApi";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { useEffect, useCallback } from "react";

export default function WrongNoteView({ setWrongNotes }: { setWrongNotes?: (notes: any) => void }) {
  const auth = useAtomValue(authAtom);
  const [noteSets, setNoteSets] = useState<WrongNoteSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);

  const fetchWrongNotes = useCallback(async () => {
    if (!auth.token || !auth.isLoggedIn) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // 실제 API에서 WrongNoteSet[]을 받아온다고 가정
      const serverNoteSets: WrongNoteSet[] = await getWrongNotesFromServer(auth.token);
      setNoteSets(serverNoteSets);
    } catch (err) {
      console.error("오답노트 로딩 실패:", err);
      setError("오답노트를 불러오는데 실패했습니다.");
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

  // 모든 odaps를 flat하게 합침
  const notes: WrongNote[] = noteSets.flatMap(set => set.odaps);

  // 과목 목록 추출 (중복 제거)
  const subjects = Array.from(
    new Set(notes.map((note) => note.gichul_qna.subject))
  ).filter(Boolean);
  // 필터링된 오답노트
  const filteredNotes =
    selectedSubject === "all"
      ? notes
      : notes.filter((note) => note.gichul_qna.subject === selectedSubject);
  // recent, rest 분리 대신
  const displayNotes = showAll ? filteredNotes : filteredNotes.slice(0, 4);

  if (loading) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <p className="text-neutral-400">로딩 중...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 w-full">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BookX size={22} />
          최근 오답노트
        </h3>
        <div className="flex items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            className="px-4 py-2 text-sm font-semibold whitespace-nowrap"
            onClick={() => {
              alert(`오답 퀴즈 모드 시작! (총 ${displayNotes.length}문제)`);
            }}
          >
            오답 다시 풀기
          </Button>
          <select
            className="bg-neutral-700 text-white rounded px-4 py-2 text-sm border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold w-auto min-w-[110px]"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ height: "40px" }}
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
                <button
                  className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
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
                      {note.gichul_qna.subject} - {note.gichul_qna.qnum}번 문제
                    </p>
                    <p className="text-xs text-neutral-400">
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`text-neutral-500 transition-transform ${
                      openNoteIds.includes(note.id) ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openNoteIds.includes(note.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden px-4 pb-3"
                    >
                      <QuestionResultCard
                        question={{
                          id: note.gichul_qna.id,
                          num: note.gichul_qna.qnum,
                          questionStr: note.gichul_qna.questionstr,
                          choices: [
                            { label: "가", text: note.gichul_qna.ex1str, isImage: false },
                            { label: "나", text: note.gichul_qna.ex2str, isImage: false },
                            { label: "사", text: note.gichul_qna.ex3str, isImage: false },
                            { label: "아", text: note.gichul_qna.ex4str, isImage: false },
                          ],
                          answer: note.gichul_qna.answer,
                          explanation: note.gichul_qna.explanation || "",
                          subjectName: note.gichul_qna.subject,
                          isImageQuestion: false,
                          imageUrl: undefined,
                        }}
                        userAnswer={note.choice}
                        index={displayNotes.findIndex((n) => n.id === note.id)}
                      />
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
