import { QnaItem } from "@/types/ProblemViewer";
import { OneOdap, saveManyUserAnswers as saveWrongNotesApi } from "@/lib/wrongNoteApi";

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

// 시험 결과 저장하기 (서버)
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

// 오답 노트 저장하기
export const saveWrongNotes = async (notes: OneOdap[], odapsetId: number, token: string) => {
    try {
        await saveWrongNotesApi(notes, odapsetId, token);
        console.log("오답노트가 서버에 저장되었습니다.");
    } catch (error) {
        console.error("오답노트 저장 실패:", error);
    }
};

// 시험 결과 저장하기 (로컬)
export const saveExamResultToLocal = (resultData: any) => {
    try {
      const existingResults = JSON.parse(
        localStorage.getItem("examResults") || "[]"
      );
      existingResults.push(resultData);
      localStorage.setItem("examResults", JSON.stringify(existingResults));
      console.log("비로그인 사용자: 결과가 로컬에 임시 저장되었습니다.");
    } catch (error) {
      console.error("로컬 저장 실패:", error);
    }
}