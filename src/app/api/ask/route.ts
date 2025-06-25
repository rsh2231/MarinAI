import { NextRequest, NextResponse } from "next/server";

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const MODEL = "HuggingFaceH4/zephyr-7b-beta";

export async function POST(req: NextRequest) {
  const { question, subject, mode } = await req.json();

  if (!question || !subject || !mode) {
    return NextResponse.json({ error: "질문, 과목, 모드가 필요합니다." }, { status: 400 });
  }

  if (!HF_TOKEN) {
    return NextResponse.json({ error: "Hugging Face API 토큰이 없습니다." }, { status: 500 });
  }

  const prompt = `해기사 시험의 '${subject}' 과목 (${mode} 수준) 문제입니다.\n\nQ: ${question}\n\nA:`;

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("HF API 오류:", res.status, text);
      return NextResponse.json({ error: "AI 호출 실패" }, { status: 500 });
    }

    const data = JSON.parse(text);

    let answer = "응답이 없습니다.";
    if (Array.isArray(data)) {
      // 일반적으로 [{ generated_text: "..." }] 형식
      const output = data[0]?.generated_text || data[0]?.output;
      if (output) {
        answer = output.trim().replace(/^A:\s*/, "");
      }
    } else if (typeof data === "object" && data.generated_text) {
      answer = data.generated_text.trim().replace(/^A:\s*/, "");
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("API 호출 실패:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
