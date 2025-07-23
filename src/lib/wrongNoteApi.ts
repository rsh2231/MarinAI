export interface OneOdap {
  choice: "가" | "나" | "사" | "아";
  gichulqna_id: number;
}

export interface UserSolvedQna {
  choice: "가" | "나" | "사" | "아";
  gichulqna_id: number;
  odapset_id: number;
}

export interface ManyOdaps {
  odapset_id: number;
  odaps: OneOdap[];
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

    const response = await fetch("/api/odap/save", {
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
  authToken: string
): Promise<void> {
  const wrongNoteData: UserSolvedQna = {
    choice: selectedChoice as "가" | "나" | "사" | "아",
    gichulqna_id: questionId,
    odapset_id: odapsetId,
  };
  await saveWrongNoteToServer(wrongNoteData, authToken);
}


/**
 * 여러 오답노트를 서버에 한 번에 저장하는 함수 (Exam/CBT용)
 */
export async function saveManyWrongNotesToServer(
  manyOdaps: ManyOdaps,
  authToken: string
): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("/api/odap/savemany", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(manyOdaps),
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
  wrongNotes: OneOdap[], 
  odapsetId: number,
  authToken: string
): Promise<void> {

  const manyOdaps: ManyOdaps = {
    odapset_id: odapsetId,
    odaps: wrongNotes, 
  };
  await saveManyWrongNotesToServer(manyOdaps, authToken);
}
// =================================================================

/**
 * 서버에서 사용자의 오답노트 목록을 불러오는 함수
 */
export async function getWrongNotesFromServer(
  authToken: string
): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("/api/odap/list", {
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

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다.");
    }
    console.error("오답노트 목록 조회 오류:", error);
    throw error;
  }
}