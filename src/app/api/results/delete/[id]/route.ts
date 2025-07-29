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

  // Authorization 헤더 가져오기
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "인증 토큰이 필요합니다." },
      { status: 401 }
    );
  }

  const targetUrl = `${baseUrl}/results/${id}`;

  try {
    const apiResponse = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Authorization": authHeader,
        "Accept": "*/*",
      },
    });

    if (!apiResponse.ok) {
      let errorData;
      try {
        errorData = await apiResponse.json();
      } catch {
        errorData = { message: "삭제 실패" };
      }
      console.error(`Error from external API (${apiResponse.status}):`, errorData);
      
      if (apiResponse.status === 422) {
        const detail = errorData.detail?.[0];
        const errorMessage = detail ? `${detail.type}: ${detail.msg}` : "유효성 검사 오류";
        return NextResponse.json({ message: errorMessage }, { status: 422 });
      }
      
      return NextResponse.json(errorData, { status: apiResponse.status });
    }

    if (apiResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      const data = await apiResponse.json();
      return NextResponse.json(data);
    } catch {
      return new NextResponse(null, { status: apiResponse.status });
    }
  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
} 