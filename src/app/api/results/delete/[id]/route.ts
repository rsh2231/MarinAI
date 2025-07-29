import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
    return NextResponse.json(
      { message: "서버 구성 오류: API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const { id } = await params;

  // ID 유효성 검사
  const noteId = parseInt(id);
  if (isNaN(noteId) || noteId <= 0) {
    return NextResponse.json(
      { message: "잘못된 오답노트 ID입니다." },
      { status: 400 }
    );
  }

  // Authorization 헤더 가져오기
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "인증 토큰이 필요합니다." },
      { status: 401 }
    );
  }

  const targetUrl = `${baseUrl}/results/${noteId}`;

  try {
    console.log(`[DELETE] 오답노트 삭제 요청: ${targetUrl}`);
    
    const apiResponse = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Authorization": authHeader,
        "Accept": "*/*",
        "Content-Type": "application/json",
      },
    });

    console.log(`[DELETE] FastAPI 응답 상태: ${apiResponse.status}`);

    if (!apiResponse.ok) {
      let errorData;
      try {
        errorData = await apiResponse.json();
      } catch {
        errorData = { message: "삭제 실패" };
      }
      
      console.error(`[DELETE] FastAPI 에러 응답 (${apiResponse.status}):`, errorData);
      
      // FastAPI의 상세 에러 처리
      if (apiResponse.status === 422) {
        const detail = errorData.detail;
        let errorMessage = "유효성 검사 오류가 발생했습니다.";
        
        if (Array.isArray(detail) && detail.length > 0) {
          const firstError = detail[0];
          errorMessage = `${firstError.type || '검증 오류'}: ${firstError.msg || firstError.message || errorMessage}`;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
        
        return NextResponse.json({ 
          message: errorMessage,
          detail: errorData.detail 
        }, { status: 422 });
      }
      
      // 기타 HTTP 상태 코드별 처리
      switch (apiResponse.status) {
        case 400:
          return NextResponse.json({ 
            message: errorData.message || "잘못된 요청입니다." 
          }, { status: 400 });
        case 401:
          return NextResponse.json({ 
            message: errorData.message || "인증이 필요합니다." 
          }, { status: 401 });
        case 403:
          return NextResponse.json({ 
            message: errorData.message || "삭제 권한이 없습니다." 
          }, { status: 403 });
        case 404:
          return NextResponse.json({ 
            message: errorData.message || "삭제할 오답노트를 찾을 수 없습니다." 
          }, { status: 404 });
        case 500:
          return NextResponse.json({ 
            message: errorData.message || "서버 내부 오류가 발생했습니다." 
          }, { status: 500 });
        default:
          return NextResponse.json(errorData, { status: apiResponse.status });
      }
    }

    // 성공 응답 처리
    if (apiResponse.status === 204) {
      console.log(`[DELETE] 오답노트 삭제 성공: ID ${noteId}`);
      return new NextResponse(null, { status: 204 });
    }

    // JSON 응답이 있는 경우
    try {
      const data = await apiResponse.json();
      console.log(`[DELETE] 오답노트 삭제 성공 (JSON 응답):`, data);
      return NextResponse.json(data);
    } catch {
      console.log(`[DELETE] 오답노트 삭제 성공: ID ${noteId}`);
      return new NextResponse(null, { status: apiResponse.status });
    }
  } catch (error) {
    console.error("[DELETE] Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
} 