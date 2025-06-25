import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, subject, mode } = body;

  // 입력 검증
  if (!question || !subject || !mode) {
    return NextResponse.json(
      { error: "질문, 과목, 모드가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `당신은 해기사 '${subject}' 과목 전문 AI 튜터입니다. 응답은 '${mode}' 수준으로 친절하고 명확하게 작성해 주세요.`,
        },
        { role: "user", content: question },
      ],
    });
    const answer = chatCompletion.choices[0].message.content;
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("GPT API 오류:", error);
    return NextResponse.json({ error: "GPT 응답 실패" }, { status: 500 });
  }
}
