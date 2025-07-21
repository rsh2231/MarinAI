// FastAPI 백엔드와 연동하는 오답노트 API 함수들

export interface UserSolvedQna {
  choice: "가" | "나" | "사" | "아";
  gichulqna_id: number;
  odapset_id: number;
}

/**
 * 서버에 오답노트를 저장하는 함수
 * @param wrongNoteData - 저장할 오답노트 데이터
 * @param authToken - 인증 토큰
 * @returns 저장 결과
 */
export async function saveWrongNoteToServer(
  wrongNoteData: UserSolvedQna,
  authToken: string
): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch("/api/odap/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
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
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("요청 시간이 초과되었습니다.");
    }
    console.error("오답노트 저장 오류:", error);
    throw error;
  }
}

/**
 * 사용자가 선택한 답안을 서버에 저장
 * @param questionId - 문제 ID
 * @param selectedChoice - 선택한 답안
 * @param odapsetId - 시험 세트 ID
 * @param authToken - 인증 토큰
 */
export async function saveUserAnswer(
  questionId: number,
  selectedChoice: string,
  odapsetId: number,
  authToken: string
): Promise<void> {
  // 선택한 답안을 FastAPI 스키마에 맞게 변환
  const wrongNoteData: UserSolvedQna = {
    choice: selectedChoice as "가" | "나" | "사" | "아",
    gichulqna_id: questionId,
    odapset_id: odapsetId,
  };

  await saveWrongNoteToServer(wrongNoteData, authToken);
}

/**
 * 서버에서 사용자의 오답노트 목록을 불러오는 함수
 * @param authToken - 인증 토큰
 * @returns 오답노트 목록
 */
export async function getWrongNotesFromServer(authToken: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch("/api/odap/list", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "오답노트 목록을 불러오는데 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("요청 시간이 초과되었습니다.");
    }
    console.error("오답노트 목록 조회 오류:", error);
    throw error;
  }
} 