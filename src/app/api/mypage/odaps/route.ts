import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
    return NextResponse.json(
      { message: "서버 구성 오류: API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    // Authorization 헤더 가져오기
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const targetUrl = `${baseUrl}/mypage/odaps`;

    console.log("Fetching wrong notes from:", targetUrl);

    const apiResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error(`Error from external API (${apiResponse.status}):`, data);
      return NextResponse.json(data, { status: apiResponse.status });
    }

    // FastAPI 응답 구조에 맞게 데이터 변환
    // 단일 객체를 배열로 감싸고, WrongNoteSet 형태로 변환
    const transformedData = transformWrongNoteData(data);

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}

// FastAPI 응답 데이터를 WrongNoteSet 형태로 변환하는 함수
function transformWrongNoteData(data: any): any[] {
  try {
    // 데이터가 배열인 경우
    if (Array.isArray(data)) {
      return data
        .map(item => transformSingleWrongNote(item))
        .filter(item => item !== null);
    }
    
    // 데이터가 단일 객체인 경우 (현재 FastAPI 응답)
    if (data && typeof data === 'object') {
      const transformed = transformSingleWrongNote(data);
      return transformed ? [transformed] : [];
    }
    
    // 빈 배열 반환
    return [];
  } catch (error) {
    console.error("Data transformation error:", error);
    return [];
  }
}

// 단일 오답노트 데이터를 WrongNoteSet 형태로 변환
function transformSingleWrongNote(data: any): any {
  try {
    // 필수 필드 검증
    if (!data || typeof data !== 'object') {
      console.warn("Invalid wrong note data: not an object", data);
      return null;
    }

    if (!data.id || !data.questionstr) {
      console.warn("Invalid wrong note data: missing required fields", data);
      return null;
    }

    // gichulset 정보 추출
    const gichulset = data.gichulset || {};
    
    // WrongNote 형태로 변환
    const wrongNote = {
      id: data.result_id || data.id,
      choice: data.choice || "",
      gichul_qna: {
        id: data.id,
        subject: data.subject || "",
        qnum: data.qnum || 1,
        questionstr: data.questionstr || "",
        ex1str: data.ex1str || "",
        ex2str: data.ex2str || "",
        ex3str: data.ex3str || "",
        ex4str: data.ex4str || "",
        answer: data.answer || "",
        explanation: data.explanation || null,
        gichulset: {
          year: gichulset.year || null,
          type: gichulset.type || "",
          grade: gichulset.grade || "",
          inning: gichulset.inning || ""
        }
      },
      attempt_count: data.attempt_count || data.attempt_counts || 1
    };

    // WrongNoteSet 형태로 반환
    return {
      id: data.result_id || data.id,
      examtype: "wrong_note",
      created_date: new Date().toISOString(), // 현재 시간으로 설정
      results: [wrongNote]
    };
  } catch (error) {
    console.error("Single wrong note transformation error:", error);
    return null;
  }
} 