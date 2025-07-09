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

  // 프론트엔드에서 온 요청 URL의 파라미터를 가져옵니다.
  const originalParams = new URL(request.url).searchParams;

  // ✅ [수정된 부분] 외부 API로 보낼 새로운 파라미터를 생성합니다.
  const targetParams = new URLSearchParams();

  // 1. 'year'와 'license'는 그대로 전달합니다.
  targetParams.set('year', originalParams.get('year') || '');
  targetParams.set('license', originalParams.get('license') || '');

  // 2. 'level'과 'round' 값에서 숫자만 추출합니다.
  const levelStr = originalParams.get('level') || '';
  const roundStr = originalParams.get('round') || '';

  // 정규식을 사용하여 문자열에서 첫 번째로 나오는 숫자 시퀀스를 찾습니다.
  // "1급" -> "1", "2회" -> "2", "소형선박조종사" (level이 없을때) -> ""
  const levelNum = levelStr.match(/\d+/)?.[0] || '';
  const roundNum = roundStr.match(/\d+/)?.[0] || '';

  targetParams.set('level', levelNum);
  targetParams.set('round', roundNum);

  // 3. 정제된 파라미터를 사용하여 외부 API에 요청할 전체 URL을 조립합니다.
  const targetUrl = `${baseUrl}/api/solve?${targetParams.toString()}`;

  // 디버깅을 위해 최종 요청 URL을 로그로 남깁니다.
  console.log("Proxying request to:", targetUrl);
  // 예상 출력: Proxying request to: http://.../api/solve?year=2023&license=항해사&level=1&round=1

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
      // 외부 API가 보낸 에러 메시지와 상태 코드를 그대로 전달
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