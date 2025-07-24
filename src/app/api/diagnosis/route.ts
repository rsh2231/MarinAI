// app/api/diagnosis/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { wrongNotes, examResults } = await req.json();

  const prompt = `
  당신은 수험생에게 개인 맞춤 학습 피드백을 제공하는 교육 전문가입니다.
  
  다음은 사용자의 오답노트와 시험 결과 데이터입니다.
  
  [오답노트]
  ${JSON.stringify(wrongNotes, null, 2)}
  
  [시험 결과]
  ${JSON.stringify(examResults, null, 2)}
  
  이 데이터를 바탕으로 아래 내용을 포함한 한국어 맞춤 피드백을 제공하세요.
  
  1. 자주 틀리는 개념 또는 유형
  2. 전반적인 학습 상태에 대한 진단
  3. 보완이 필요한 영역 또는 학습 전략 제안
  
  **중요:**
  - 전체 내용은 전문가의 신뢰감 있는 어조로 작성해주세요.
  - 결과를 Markdown 형식으로 구조화하여 작성해주세요. 예를 들어, 각 섹션의 제목 앞에는 '##'를, 목록 앞에는 '-'를 사용해주세요.
  - 문장은 친절하고 명확하게 작성해 주세요.
  `;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "서버에 Gemini API 키가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API Error:", errorBody);
    return NextResponse.json(
      { message: "Gemini API 호출에 실패했습니다." },
      { status: response.status }
    );
  }

  const data = await response.json();
  const aiMessage =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "AI 진단을 생성할 수 없습니다.";
  return NextResponse.json({ message: aiMessage });
}