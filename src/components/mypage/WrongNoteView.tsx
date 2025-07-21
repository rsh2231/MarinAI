"use client";
import { useEffect, useState, useCallback } from "react";
import { useAtomValue } from "jotai";
import { BookX, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { getWrongNotesFromServer } from "@/lib/wrongNoteApi";
import { authAtom } from "@/atoms/authAtom";

interface ServerWrongNote {
  id: number;
  choice: string;
  gichulqna_id: number;
  odapset_id: number;
  created_at: string;
  // 추가 필드들은 백엔드 응답에 따라 확장
}

export default function WrongNoteView() {
  const [notes, setNotes] = useState<ServerWrongNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 인증 상태 가져오기
  const auth = useAtomValue(authAtom);

  const fetchWrongNotes = useCallback(async () => {
    if (!auth.token || !auth.isLoggedIn) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const serverNotes = await getWrongNotesFromServer(auth.token);
      setNotes(serverNotes.slice(0, 5)); // 최근 5개만 표시
    } catch (err) {
      console.error('오답노트 로딩 실패:', err);
      setError("오답노트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [auth.token, auth.isLoggedIn]);

  useEffect(() => {
    fetchWrongNotes();
  }, [fetchWrongNotes]);

  if (loading) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookX size={22} />최근 오답노트
        </h3>
        <p className="text-neutral-400">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookX size={22} />최근 오답노트
        </h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookX size={22} />최근 오답노트
      </h3>
      {notes.length === 0 ? (
        <p className="text-neutral-400">저장된 오답노트가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map(note => (
            <li key={note.id} className="flex justify-between items-center p-3 bg-neutral-700/50 rounded-md hover:bg-neutral-700 transition-colors">
              <div>
                <p className="font-semibold">문제 #{note.gichulqna_id}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight size={20} className="text-neutral-500" />
            </li>
          ))}
        </ul>
      )}
      <div className="text-right mt-4">
        <Link href="/note" className="text-sm text-blue-400 hover:text-blue-300">
          전체 오답노트 보기 →
        </Link>
      </div>
    </div>
  );
}