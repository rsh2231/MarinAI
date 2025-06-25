import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { problem } = body;

  if (!problem) {
    return NextResponse.json({ error: "문제 내용이 없습니다." }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "당신은 해기사 시험 문제를 정확히 분석하고 해설을 제공하는 AI 튜터입니다. 사용자가 붙여넣은 문제를 기반으로:\n1. 정답을 명확히 지정하고\n2. 정답에 대한 이유\n3. 다른 선택지에 대한 오답 이유\n를 친절하고 정확하게 설명해주세요.",
        },
        { role: "user", content: problem },
      ],
    });

    const explanation = completion.choices[0].message.content;
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("문제풀이 GPT 오류:", error);
    return NextResponse.json({ error: "AI 문제풀이 실패" }, { status: 500 });
  }
}
