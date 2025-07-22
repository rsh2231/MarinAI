import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
    return NextResponse.json(
      { message: "서버 구성 오류: API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "multipart/form-data만 지원합니다." },
        { status: 415 }
      );
    }

    const formData = await req.formData();
    const question = formData.get("question");
    const image = formData.get("image");

    if (!question && !image) {
      return NextResponse.json(
        { error: "텍스트 또는 이미지가 필요합니다." },
        { status: 400 }
      );
    }

    const targetUrl = `${baseUrl}/rag/query`;
    console.log("📡 Proxying RAG request to:", targetUrl);

    // 인증 헤더 추가 (선택적)
    const headers: HeadersInit = {};
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      headers.Authorization = authHeader;
      console.log("🔐 Forwarding authorization header to RAG API");
    }

    // fetch는 formData를 자동으로 multipart/form-data로 처리
    const fastapiRes = await fetch(targetUrl, {
      method: "POST",
      body: formData,
      headers,
    });

    const data = await fastapiRes.json();

    if (!fastapiRes.ok) {
      console.error(
        `❌ Error from external RAG API (${fastapiRes.status}):`,
        data
      );
      return NextResponse.json(data, { status: fastapiRes.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 RAG Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 RAG API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}
