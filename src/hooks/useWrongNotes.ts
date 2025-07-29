import { useState, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { WrongNoteSet, WrongNote } from "@/types/wrongNote";
import { getWrongNotesFromServer, deleteWrongNoteFromServer } from "@/lib/wrongNoteApi";

export function useWrongNotes() {
  const auth = useAtomValue(authAtom);
  const [noteSets, setNoteSets] = useState<WrongNoteSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingNoteIds, setDeletingNoteIds] = useState<number[]>([]);

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

  const deleteNote = useCallback(async (noteId: number) => {
    setDeletingNoteIds(prev => [...prev, noteId]);
    
    setNoteSets(prevSets => 
      prevSets.map(set => ({
        ...set,
        results: set.results.filter(n => n.id !== noteId)
      })).filter(set => set.results.length > 0)
    );

    try {
      if (auth.token) {
        await deleteWrongNoteFromServer(auth.token, noteId);
      }
    } catch (serverErr) {
      console.warn('서버에서 오답노트 삭제 실패:', serverErr);
    } finally {
      setDeletingNoteIds(prev => prev.filter(id => id !== noteId));
    }
  }, [auth.token]);
  
  const allNotes: WrongNote[] = useMemo(() => 
    noteSets
      .filter(set => set && set.results)
      .flatMap(set => set.results.filter(note => note && note.gichul_qna)),
    [noteSets]
  );

  return {
    allNotes,
    loading,
    error,
    deletingNoteIds,
    fetchWrongNotes,
    deleteNote,
  };
}