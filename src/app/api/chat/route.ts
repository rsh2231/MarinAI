import { InferenceClient } from "@huggingface/inference";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          error: "message 필드는 필수이며 문자열이어야 합니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new InferenceClient(process.env.HF_TOKEN);

    const chatCompletion = await client.chatCompletion({
      provider: "featherless-ai",
      model: "SEOKDONG/llama3.1_korean_v1.1_sft_by_aidx",
      messages: [{ role: "user", content: message }],
    });

    return new Response(
      JSON.stringify({ answer: chatCompletion.choices[0].message.content }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API 호출 실패:", error);
    return new Response(JSON.stringify({ error: "API 호출 실패" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
