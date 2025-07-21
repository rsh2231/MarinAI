"use client";
import { useEffect, useState, useCallback } from "react";
import { useAtomValue } from "jotai";
import { BookX, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { getWrongNotesFromServer } from "@/lib/wrongNoteApi";
import { authAtom } from "@/atoms/authAtom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface ServerWrongNote {
  id: number;
  choice: string;
  gichulqna_id: number;
  odapset_id: number;
  created_at: string;
  // 추가 필드들은 백엔드 응답에 따라 확장
  subject: string; // 과목명 필드 추가
  question?: string; // 문제 텍스트
  choices?: { label: string; text: string }[]; // 선택지
  answer?: string; // 정답
  explanation?: string; // 해설
  count?: number; // 오답 횟수 필드 추가
  memo?: string; // 오답 원인 메모 필드 추가
}

// 더미 오답노트 데이터 (count 필드 추가)
const dummyNotes: ServerWrongNote[] = [
  {
    id: 1,
    subject: "기관1",
    gichulqna_id: 101,
    odapset_id: 1,
    created_at: "2024-07-05T14:00:00Z",
    choice: "나",
    question: "기관1의 주요 역할은 무엇인가?",
    choices: [
      { label: "가", text: "항해" },
      { label: "나", text: "기관 관리" },
      { label: "다", text: "통신" },
      { label: "라", text: "구조" },
    ],
    answer: "가",
    explanation: "기관1은 선박의 기관을 관리하는 역할을 합니다.",
    count: 3,
  },
  {
    id: 2,
    subject: "기관2",
    gichulqna_id: 102,
    odapset_id: 1,
    created_at: "2024-07-02T11:00:00Z",
    choice: "다",
    question: "기관2에서 사용하는 연료는?",
    choices: [
      { label: "가", text: "경유" },
      { label: "나", text: "휘발유" },
      { label: "다", text: "중유" },
      { label: "라", text: "LPG" },
    ],
    answer: "가",
    explanation: "기관2는 주로 경유를 사용합니다.",
    count: 1,
  },
  {
    id: 3,
    subject: "직무일반",
    gichulqna_id: 103,
    odapset_id: 1,
    created_at: "2024-07-03T12:00:00Z",
    choice: "라",
    question: "직무일반에서 중요한 역량은?",
    choices: [
      { label: "가", text: "체력" },
      { label: "나", text: "지식" },
      { label: "다", text: "경험" },
      { label: "라", text: "책임감" },
    ],
    answer: "나",
    explanation: "직무일반에서는 지식이 중요합니다.",
    count: 2,
  },
  {
    id: 4,
    subject: "영어",
    gichulqna_id: 104,
    odapset_id: 1,
    created_at: "2024-07-04T13:00:00Z",
    choice: "가",
    question: "다음 중 영어로 올바른 표현은?",
    choices: [
      { label: "가", text: "How are you?" },
      { label: "나", text: "How is you?" },
      { label: "다", text: "How be you?" },
      { label: "라", text: "How are she?" },
    ],
    answer: "가",
    explanation: "How are you?가 올바른 표현입니다.",
    count: 1,
  },
];

// 오답노트 추가/업데이트 함수 (중복시 최신으로 올리고 count 증가)
function addOrUpdateWrongNote(newNote: ServerWrongNote, setNotes: React.Dispatch<React.SetStateAction<ServerWrongNote[]>>) {
  setNotes(prev => {
    const idx = prev.findIndex(n => n.gichulqna_id === newNote.gichulqna_id);
    if (idx !== -1) {
      // 이미 있으면 count 증가, created_at 갱신
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        created_at: newNote.created_at,
        count: (updated[idx].count || 1) + 1,
      };
      // 최신순 정렬
      return updated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // 없으면 새로 추가
      return [{ ...newNote, count: 1 }, ...prev];
    }
  });
}

export default function WrongNoteView() {
  // 서버 연동 대신 더미 데이터 사용
  const [notes, setNotes] = useState<ServerWrongNote[]>(dummyNotes);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  // 과목 필터 상태 추가
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);

  // 오답 다시 풀기(퀴즈 모드) 핸들러
  const handleStartWrongNoteQuiz = () => {
    // 현재 필터링된 오답 리스트를 퀴즈 모드로 전달 (여기선 alert)
    alert(`오답 퀴즈 모드 시작! (총 ${displayNotes.length}문제)`);
    // 실제 구현: 라우터 이동, 모달 오픈, 상태 변경 등
  };

  // 아래 서버 연동 코드는 주석 처리
  // const auth = useAtomValue(authAtom);
  // const fetchWrongNotes = useCallback(async () => {
  //   if (!auth.token || !auth.isLoggedIn) {
  //     setError("로그인이 필요합니다.");
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const serverNotes = await getWrongNotesFromServer(auth.token);
  //     setNotes(serverNotes);
  //   } catch (err) {
  //     console.error("오답노트 로딩 실패:", err);
  //     setError("오답노트를 불러오는데 실패했습니다.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [auth.token, auth.isLoggedIn]);

  // useEffect(() => {
  //   fetchWrongNotes();
  //   console.log("Notes", notes);
  // }, [fetchWrongNotes]);

  // 과목 목록 추출 (중복 제거)
  const subjects = Array.from(new Set(notes.map(note => note.subject))).filter(Boolean);
  // 필터링된 오답노트
  const filteredNotes = selectedSubject === "all"
    ? notes
    : notes.filter(note => note.subject === selectedSubject);
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
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookX size={22} />
        최근 오답노트
      </h3>
      {/* 과목 필터 드롭박스 위쪽 div를 아래처럼 수정 */}
      <div className="flex items-center gap-2 mb-4 justify-end">
        <Button
          variant="primary"
          className="px-4 py-1.5 font-semibold text-sm"
          onClick={handleStartWrongNoteQuiz}
        >
          오답 다시 풀기
        </Button>
        <select
          className="bg-neutral-700 text-white rounded px-3 py-1"
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
        >
          <option value="all">전체 과목</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      {filteredNotes.length === 0 ? (
        <p className="text-neutral-400">해당 과목의 오답노트가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {displayNotes.map((note) => (
            <li
              key={note.id}
              className="flex flex-col bg-neutral-700/50 rounded-md p-0"
            >
              <button
                className="w-full flex justify-between items-center p-3 text-left focus:outline-none"
                onClick={() => setOpenNoteIds((prev) => prev.includes(note.id) ? prev.filter((nid) => nid !== note.id) : [...prev, note.id])}
              >
                <div>
                  <p className="font-semibold">
                    {note.subject} - 문제 #{note.gichulqna_id}
                    {(note.count ?? 1) > 1 && (
                      <span className="ml-2 text-xs text-blue-400 font-bold">{note.count ?? 1}회</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight size={20} className={`text-neutral-500 transition-transform ${openNoteIds.includes(note.id) ? "rotate-90" : ""}`} />
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
                    {/* 상세 카드 내용: 실제 note에 문제 정보가 있다고 가정 */}
                    <div className="mt-2 text-sm text-gray-200">
                      <div className="mb-2 font-semibold">{note.question || "문제 내용 예시"}</div>
                      {note.choices && Array.isArray(note.choices) && (
                        <ul className="mb-2 space-y-1">
                          {note.choices.map((choice: any, idx: number) => (
                            <li key={idx} className={`px-3 py-1 rounded ${note.answer === choice.label ? "bg-green-900/30 text-green-300" : note.choice === choice.label ? "bg-red-900/30 text-red-300" : "bg-neutral-800/50 text-gray-100"}`}>{choice.label}. {choice.text}</li>
                          ))}
                        </ul>
                      )}
                      <div className="text-xs text-gray-400 mb-1">정답: <span className="font-bold text-green-400">{note.answer || "?"}</span></div>
                      <div className="text-xs text-gray-400">내 답: <span className="font-bold text-red-400">{note.choice || "?"}</span></div>
                      <div className="mt-2 border-t border-neutral-600 pt-2">
                        <span className="font-semibold">해설</span>
                        <div className="pl-2 mt-1 text-gray-300 whitespace-pre-wrap">{note.explanation || "해설 정보가 없습니다."}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
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
