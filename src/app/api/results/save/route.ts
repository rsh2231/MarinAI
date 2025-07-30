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
    const { choice, gichulqna_id, odapset_id, answer } = body;

    console.log("[API /results/save] 받은 데이터:", {
      choice,
      gichulqna_id,
      odapset_id,
      answer
    });

    // 필수 필드 검증
    if (!choice || !gichulqna_id || !odapset_id || !answer) {
      return NextResponse.json(
        { message: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // choice 값 검증 (가, 나, 사, 아 중 하나)
    if (!["가", "나", "사", "아"].includes(choice)) {
      return NextResponse.json(
        { message: "유효하지 않은 선택지입니다." },
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

    const targetUrl = `${baseUrl}/results/save`;

    console.log("Saving wrong note to:", targetUrl);

    const requestBody = {
      choice,
      gichulqna_id,
      odapset_id,
      answer,
    };

    console.log("[API /results/save] 외부 API로 전송할 데이터:", requestBody);

    const apiResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(requestBody),
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