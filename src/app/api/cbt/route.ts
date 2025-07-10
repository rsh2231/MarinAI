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

  // 1. 'license'는 그대로 전달
  targetParams.set('license', originalParams.get('license') || '');

  // 2. 'level' 값에서 숫자만 추출
  const levelStr = originalParams.get('level') || '';
  const levelNum = levelStr.match(/\d+/)?.[0] || '';
  targetParams.set('level', levelNum);

  // 3. 'subjects'는 모든 값을 전달 (다중 선택 가능)
  const subjects = originalParams.getAll('subjects');
  subjects.forEach(subject => targetParams.append('subjects', subject));

  const targetUrl = `${baseUrl}/api/cbt?${targetParams.toString()}`;

  console.log("Proxying CBT request to:", targetUrl);

  try {
    const apiResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error(`Error from external CBT API (${apiResponse.status}):`, data);
      return NextResponse.json(data, { status: apiResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("CBT Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 CBT API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 } 
    );
  }
}