import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
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

    const targetUrl = `${baseUrl}/cbt/result/`;
    console.log("📡 Saving CBT result to:", targetUrl);

    const apiResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error(`❌ Error from external CBT result API (${apiResponse.status}):`, data);
      return NextResponse.json(data, { status: apiResponse.status });
    }

    console.log("✅ CBT result saved successfully");
    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 CBT Result API Error:", error);
    return NextResponse.json(
      { message: "CBT 결과 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 