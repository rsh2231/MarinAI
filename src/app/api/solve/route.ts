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

  const originalParams = request.nextUrl.searchParams;
  const targetParams = new URLSearchParams();

  const examtype = originalParams.get('examtype') || 'practice'; // 기본값은 practice
  const year = originalParams.get('year') || '';
  const license = originalParams.get('license') || '';
  const levelStr = originalParams.get('level') || '';
  const roundStr = originalParams.get('round') || '';

  // ✅ [수정된 로직] 소형선박조종사일 경우 level을 '0'으로 설정
  const finalLevel = 
    license === '소형선박조종사'
      ? '0' // 소형선박조종사는 level을 '0'으로 고정
      : levelStr.match(/\d+/)?.[0] || ''; // 그 외에는 숫자 추출

  const finalRound = roundStr.match(/\d+/)?.[0] || '';

  targetParams.set('examtype', examtype);
  targetParams.set('year', year);
  targetParams.set('license', license);
  targetParams.set('level', finalLevel); // 정제된 level 값 사용
  targetParams.set('round', finalRound);

  const targetUrl = `${baseUrl}/solve/?${targetParams.toString()}`;

  console.log("Examtype:", examtype);
  console.log("Proxying question list request to:", targetUrl);

  // 인증 헤더 가져오기 (선택적)
  const authHeader = request.headers.get("authorization");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // 인증 헤더가 있으면 백엔드로 전달 (로그인한 사용자)
  if (authHeader) {
    headers.Authorization = authHeader;
    console.log("인증된 사용자로 문제 요청");
  } else {
    console.log("비로그인 사용자로 문제 요청");
  }

  try {
    const apiResponse = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: 'no-store',
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