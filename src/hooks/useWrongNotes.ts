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
  const [deleteFeedback, setDeleteFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
      
      // hidden = False인 항목들만 필터링 (백엔드에서 hidden 필드 제공)
      const validatedNoteSets = Array.isArray(serverNoteSets)
        ? serverNoteSets
            .filter(set => set && typeof set === 'object' && Array.isArray(set.results))
            .map(set => {
              const filteredResults = set.results.filter(note => 
                note && 
                (note.hidden === false || note.hidden === undefined) // hidden이 false이거나 undefined인 경우 표시
              );
              return {
                ...set,
                results: filteredResults
              };
            })
            .filter(set => set.results.length > 0) // 결과가 있는 세트만 유지
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
    if (!auth.token || !auth.isLoggedIn) {
      setDeleteFeedback({
        type: 'error',
        message: '로그인이 필요합니다.'
      });
      return;
    }

    setDeletingNoteIds(prev => [...prev, noteId]);
    setDeleteFeedback(null);

    // 낙관적 업데이트: UI에서 즉시 제거
    const originalNoteSets = [...noteSets];
    setNoteSets(prevSets => 
      prevSets.map(set => ({
        ...set,
        results: set.results.filter(n => n.id !== noteId)
      })).filter(set => set.results.length > 0)
    );

    try {
      const result = await deleteWrongNoteFromServer(auth.token, noteId);
      
      // 성공 피드백 표시
      setDeleteFeedback({
        type: 'success',
        message: result.message || '오답노트가 성공적으로 삭제되었습니다.'
      });

      // 서버에서 최신 데이터를 다시 가져와서 일관성 보장
      await fetchWrongNotes();

      // 3초 후 피드백 메시지 제거
      setTimeout(() => {
        setDeleteFeedback(null);
      }, 3000);

    } catch (serverErr) {
      console.error('서버에서 오답노트 삭제 실패:', serverErr);
      
      // 실패 시 원래 상태로 복원
      setNoteSets(originalNoteSets);
      
      // 에러 피드백 표시
      const errorMessage = serverErr instanceof Error 
        ? serverErr.message 
        : '오답노트 삭제에 실패했습니다.';
      
      setDeleteFeedback({
        type: 'error',
        message: errorMessage
      });

      // 5초 후 에러 메시지 제거
      setTimeout(() => {
        setDeleteFeedback(null);
      }, 5000);
    } finally {
      setDeletingNoteIds(prev => prev.filter(id => id !== noteId));
    }
  }, [auth.token, auth.isLoggedIn, noteSets, fetchWrongNotes]);
  
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
    deleteFeedback,
    fetchWrongNotes,
    deleteNote,
    clearDeleteFeedback: () => setDeleteFeedback(null),
  };
}