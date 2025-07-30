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

  const originalParams = new URL(request.url).searchParams;
  const targetParams = new URLSearchParams();


  const license = originalParams.get("license") || "";
  targetParams.set("license", license);

  // 'level' 값에서 숫자만 추출 ("1급" -> "1")
  const levelStr = originalParams.get("level") || "";
  const levelNum = levelStr.match(/\d+/)?.[0] || "";
  targetParams.set("level", levelNum);

  // 'subjects'는 다중 전달 허용
  const subjects = originalParams.getAll("subjects");
  subjects.forEach((subject) => {
    if (subject) {
      targetParams.append("subjects", subject);
    }
  });

  const targetUrl = `${baseUrl}/cbt/?${targetParams.toString()}`;

  // 인증 헤더 추가 (선택적)
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Authorization 헤더가 있으면 전달
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const apiResponse = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error(`❌ Error from external CBT API (${apiResponse.status}):`, data);
      return NextResponse.json(data, { status: apiResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 CBT Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 CBT API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}
