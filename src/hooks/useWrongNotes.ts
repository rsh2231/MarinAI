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
      const data = await getWrongNotesFromServer(auth.token);
      
      // 데이터 검증 및 필터링
      const validatedNoteSets = data && Array.isArray(data)
        ? data
            .filter(set => set && set.results && Array.isArray(set.results))
            .map(set => ({
              ...set,
              results: set.results.filter(result => 
                result && 
                result.id && 
                result.gichul_qna && 
                typeof result.gichul_qna === 'object'
              )
            }))
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
      await deleteWrongNoteFromServer(auth.token, noteId);
      
      // 성공 시 추가 fetch 없이 낙관적 업데이트 유지
      // 서버와의 일관성은 다음 페이지 방문 시 자동으로 맞춰짐

    } catch (serverErr) {
      console.error('서버에서 오답노트 삭제 실패:', serverErr);
      
      // 실패 시 원래 상태로 복원
      setNoteSets(originalNoteSets);
      
      // 에러 피드백만 표시
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
  }, [auth.token, auth.isLoggedIn, noteSets]);
  
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