import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.EXTERNAL_API_BASE_URL

export async function POST(req: NextRequest) {
  try {
    // 1. 클라이언트로부터 데이터와 인증 토큰 추출
    const { wrongNotes, examResults } = await req.json();
    const authToken = req.headers.get("Authorization");

    if (!authToken) {
      return new NextResponse(JSON.stringify({ message: "인증 토큰이 없습니다." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. FastAPI에 보낼 FormData 생성
    const formData = new FormData();
    formData.append("wrong", JSON.stringify(wrongNotes));
    formData.append("examresults", JSON.stringify(examResults));

    // 3. FastAPI로 스트리밍 요청
    const res = await fetch(`${baseUrl}/modelcall/diag`, {
      method: "POST",
      headers: {
        // 클라이언트로부터 받은 인증 토큰을 그대로 전달
        Authorization: authToken,
      },
      body: formData,
    });

    // FastAPI에서 오류가 발생한 경우
    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(
        JSON.stringify({ message: `백엔드 서버 오류: ${errorText}` }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. FastAPI의 스트림을 클라이언트로 전달하기 위한 새로운 ReadableStream 생성
    const stream = new ReadableStream({
      async start(controller) {
        if (!res.body) {
          controller.close();
          return;
        }
        const reader = res.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // 받은 데이터 청크를 클라이언트로 그대로 보냄
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    // 5. 스트림을 클라이언트로 응답
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