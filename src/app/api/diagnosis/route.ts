import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.EXTERNAL_API_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    // 클라이언트로부터 데이터와 인증 토큰 추출
    const { wrongNotes, examResults } = await req.json();
    const authToken = req.headers.get("Authorization");

    if (!authToken) {
      return new NextResponse(JSON.stringify({ message: "인증 토큰이 없습니다." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const requestUrl = `${baseUrl}/modelcall/diag`;
    
    console.log("Requesting to FastAPI URL:", requestUrl);

    const res = await fetch(requestUrl, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        wrong: JSON.stringify(wrongNotes),
        examresults: JSON.stringify(examResults)
      }),
    });

  
    if (!res.ok) {
      const errorText = await res.text();
      console.error("FastAPI 서버 오류 응답:", errorText); 
      return new NextResponse(
        JSON.stringify({ message: `백엔드 서버 오류: ${errorText}` }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        if (!res.body) {
          controller.close();
          return;
        }
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("Diagnosis API Route Error:", error);
    return new NextResponse(
      JSON.stringify({ message: "API 라우트 처리 중 오류 발생" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}