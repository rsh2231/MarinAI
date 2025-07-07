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
    const prompt = `당신은 해기사 시험 문제를 정확히 분석하고 해설을 제공하는 AI 튜터입니다. 사용자가 붙여넣은 문제를 기반으로:
1. 정답을 명확히 지정하고
2. 정답에 대한 이유
3. 다른 선택지에 대한 오답 이유
를 친절하고 정확하게 설명해주세요.

문제:
${problem}`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ explanation: text });
  } catch (error) {
    console.error("Gemini SDK 호출 오류:", error);
    return NextResponse.json(
      { error: "AI 문제풀이 실패 (Gemini SDK)" },
      { status: 500 }
    );
  }
}