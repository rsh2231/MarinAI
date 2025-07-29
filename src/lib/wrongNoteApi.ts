import { WrongNoteSet } from "@/types/wrongNote";

export interface OneResult {
  choice: "가" | "나" | "사" | "아";
  gichulqna_id: number;
  answer: string;
}

export interface UserSolvedQna {
  choice: "가" | "나" | "사" | "아";
  gichulqna_id: number;
  odapset_id: number;
  answer: string;
}

export interface ManyResults {
  odapset_id: number;
  duration_sec: number;
  results: OneResult[];
}

/**
 * 서버에 오답노트를 저장하는 함수 (개별 저장용)
 */
export async function saveWrongNoteToServer(
  wrongNoteData: UserSolvedQna,
  authToken: string
): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("/api/results/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(wrongNoteData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "오답노트 저장에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다.");
    }
    console.error("오답노트 저장 오류:", error);
    throw error;
  }
}

/**
 * 사용자가 선택한 답안을 서버에 저장
 */
export async function saveUserAnswer(
  questionId: number,
  selectedChoice: string,
  odapsetId: number,
  authToken: string,
  correctAnswer?: string
): Promise<void> {
  const wrongNoteData: UserSolvedQna = {
    choice: selectedChoice as "가" | "나" | "사" | "아",
    gichulqna_id: questionId,
    odapset_id: odapsetId,
    answer: correctAnswer || selectedChoice, // 정답이 없으면 선택한 답을 정답으로 사용
  };
  await saveWrongNoteToServer(wrongNoteData, authToken);
}


/**
 * 여러 오답노트를 서버에 한 번에 저장하는 함수 (Exam/CBT용)
 */
export async function saveManyWrongNotesToServer(
  manyResults: ManyResults,
  authToken: string
): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("/api/results/savemany", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(manyResults),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.detail?.[0]?.msg || "오답노트 일괄 저장에 실패했습니다.";
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("오답노트 일괄 저장 오류:", error);
    throw error;
  }
}

/**
 * 여러 오답을 한 번에 저장 (Exam/CBT용) - 호출용 헬퍼 함수
 */
export async function saveManyUserAnswers(
  wrongNotes: OneResult[], 
  odapsetId: number,
  authToken: string,
  durationSec: number = 0
): Promise<void> {

  const manyResults: ManyResults = {
    odapset_id: odapsetId,
    duration_sec: durationSec,
    results: wrongNotes, 
  };
  await saveManyWrongNotesToServer(manyResults, authToken);
}

/**
 * 여러 오답을 한 번에 저장 (Exam/CBT용) - 간편 호출용 헬퍼 함수
 */
export async function saveManyUserAnswersSimple(
  wrongNotes: Array<{choice: string, gichulqna_id: number, answer?: string}>, 
  odapsetId: number,
  authToken: string,
  durationSec: number = 0
): Promise<void> {
  const processedWrongNotes: OneResult[] = wrongNotes.map(note => ({
    choice: note.choice as "가" | "나" | "사" | "아",
    gichulqna_id: note.gichulqna_id,
    answer: note.answer || note.choice, // 정답이 없으면 선택한 답을 정답으로 사용
  }));

  await saveManyUserAnswers(processedWrongNotes, odapsetId, authToken, durationSec);
}
// =================================================================

/**
 * 서버에서 사용자의 오답노트 목록을 불러오는 함수
 */
export async function getWrongNotesFromServer(
  authToken: string
): Promise<WrongNoteSet[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("/api/mypage/odaps", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "오답노트 목록을 불러오는데 실패했습니다."
      );
    }

    return await response.json(); // 응답이 배열이면 그대로 반환
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다.");
    }
    console.error("오답노트 목록 조회 오류:", error);
    throw error;
  }
}

export async function deleteWrongNoteFromServer(token: string, noteId: number) {
  const res = await fetch(`/api/results/delete/${noteId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    let errorMessage = "오답노트 삭제 실패";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON 파싱 실패 시 상태 코드에 따른 기본 메시지
      if (res.status === 404) {
        errorMessage = "삭제할 오답노트를 찾을 수 없습니다.";
      } else if (res.status === 422) {
        errorMessage = "유효성 검사 오류가 발생했습니다.";
      } else if (res.status === 401) {
        errorMessage = "인증이 필요합니다.";
      }
    }
    throw new Error(errorMessage);
  }
  
  if (res.status === 204) {
    return {};
  }
  
  try {
    return await res.json();
  } catch {
    return {};
  }
}