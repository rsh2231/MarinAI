import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problem } = body;

    if (!problem || typeof problem !== "string" || problem.trim() === "") {
      return NextResponse.json(
        { error: "유효한 문제 내용이 없습니다." },
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

    // ✅ 프롬프트 개선: 역할을 명확히 하고, 마크다운 사용을 유도하여 서식을 개선
    const prompt = `당신은 해기사 시험 문제를 명확하게 해설하는 AI 튜터입니다.
    아래 문제에 대해, 정답이 왜 정답인지 그 이유를 **핵심 원리 위주로, 마크다운을 사용하여** 설명해주세요.
    - 가장 중요한 핵심 내용은 **굵은 글씨**로 강조해주세요.
    - 필요한 경우, 간단한 목록(리스트)을 사용하여 가독성을 높여주세요.
    - 전체 설명은 3~4 문장으로 간결하게 유지해주세요.

[문제 시작]
${problem}
[문제 끝]`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // ✅ 안전 설정 추가: 유해 콘텐츠로 인한 차단 가능성을 낮춤
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          // ✅ chunk.text()가 존재하는지 확인하여 안정성 강화
          if (chunk && typeof chunk.text === "function") {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Gemini SDK 호출 오류:", error);
    // ✅ 에러 응답을 JSON 형식으로 통일
    return NextResponse.json(
      { error: "AI 해설 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
