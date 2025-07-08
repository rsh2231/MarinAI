import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { problem } = body;

  if (!problem) {
    return NextResponse.json(
      { error: "문제 내용이 없습니다." },
      { status: 400 }
    );
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("Gemini API 키가 설정되지 않았습니다.");
    return NextResponse.json(
      { error: "서버 설정 오류: API 키 누락" },
      { status: 500 }
    );
  }

  try {
    const prompt = `당신은 해기사 시험 문제를 분석하고 해설하는 AI 튜터입니다.
    다음 문제에 대해 정답과 그 이유를 **핵심만 간결하게 3~4문장으로** 설명해주세요.
    오답에 대한 설명은 필요한 경우에만 한 문장으로 간략하게 언급하세요.
문제:
${problem}`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContentStream(prompt);

    //ReadableStream을 사용하여 응답 스트리밍
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Gemini SDK 호출 오류:", error);
    return NextResponse.json(
      { error: "AI 문제풀이 실패 (Gemini SDK)" },
      { status: 500 }
    );
  }
}
