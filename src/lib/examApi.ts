import { QnaItem } from "@/types/ProblemViewer";
import { OneResult, saveManyUserAnswers as saveWrongNotesApi } from "@/lib/wrongNoteApi";

// --- 타입 정의 ---
interface ExamParams {
  year: string;
  license: string;
  level: string;
  round: string;
  token?: string;
}

export interface ExamResponse {
  qnas: QnaItem[];
  odapset_id?: number;
}

// 시험 문제 불러오기
export const fetchExamQuestions = async ({
  year,
  license,
  level,
  round,
  token,
}: ExamParams): Promise<ExamResponse> => {
  const params = new URLSearchParams({
    examtype: "exam",
    year,
    license,
    level,
    round,
  });
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api/solve?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || `HTTP ${res.status}: 데이터를 불러오는데 실패했습니다.`
    );
  }
  return res.json();
};


// 오답 노트 저장하기
export const saveWrongNotes = async (notes: OneResult[], odapsetId: number, token: string) => {
    try {
        await saveWrongNotesApi(notes, odapsetId, token);
        console.log("오답노트가 서버에 저장되었습니다.");
    } catch (error) {
        console.error("오답노트 저장 실패:", error);
    }
};


// CBT 결과 서버 저장 유틸
export const saveExamResultToServer = async (resultData: any, token: string) => {
  const response = await fetch("/api/exam/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(resultData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "서버에 시험 결과를 저장하는데 실패했습니다.");
  }
  return response.json();
};


// CBT 결과 서버 저장 유틸
export async function saveCbtResultToServer(resultData: any, token: string) {
  const response = await fetch("/api/cbt/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(resultData),
  });
  if (!response.ok) {
    throw new Error("서버 저장 실패");
  }
  return await response.json();
}