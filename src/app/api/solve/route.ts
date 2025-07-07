import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { problem } = body;

  if (!problem) {
    return NextResponse.json(
      { error: "문제 내용이 없습니다." },
      { status: 400 }
    );
  }

  const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
  if (!HUGGINGFACE_API_TOKEN) {
    console.error("Hugging Face API 토큰이 설정되지 않았습니다.");
    return NextResponse.json(
      { error: "서버 설정 오류: API 토큰 누락" },
      { status: 500 }
    );
  }

  try {
    // Hugging Face 모델 endpoint (예: "gpt2" 또는 "tiiuae/falcon-7b-instruct")
    const modelEndpoint = "tiiuae/falcon-7b-instruct";

    // API 호출
    const res = await fetch(
      `https://api-inference.huggingface.co/models/${modelEndpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `당신은 해기사 시험 문제를 정확히 분석하고 해설을 제공하는 AI 튜터입니다. 사용자가 붙여넣은 문제를 기반으로:
1. 정답을 명확히 지정하고
2. 정답에 대한 이유
3. 다른 선택지에 대한 오답 이유
를 친절하고 정확하게 설명해주세요.

문제:
${problem}`,
          options: { wait_for_model: true },
        }),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      console.error("Hugging Face API 오류:", errorDetails);
      return NextResponse.json(
        { error: "AI 문제풀이 실패 (Hugging Face)" },
        { status: 500 }
      );
    }

    const data = await res.json();

    // 모델에 따라 응답 구조가 다를 수 있음. 예시로 text 필드 사용.
    const explanation = Array.isArray(data)
      ? data[0]?.generated_text || ""
      : data.generated_text || "";

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("문제풀이 API 호출 오류:", error);
    return NextResponse.json({ error: "AI 문제풀이 실패" }, { status: 500 });
  }
}
