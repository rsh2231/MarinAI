import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "서버 구성 오류: API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    if (!body.odapset_id || !body.odaps) {
      return NextResponse.json(
        { message: "필수 필드(odapset_id, odaps)가 누락되었습니다." },
        { status: 400 }
      );
    }

    const targetUrl = `${baseUrl}/odap/savemany`;

    const apiResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(
        `Error from external API (${apiResponse.status}):`,
        errorText
      );
      return new NextResponse(errorText, {
        status: apiResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy API Error (savemany):", error);
    return NextResponse.json(
      { message: "외부 API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}
