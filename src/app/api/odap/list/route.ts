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

    const targetUrl = `${baseUrl}/odap/list`;

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

    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
} 