import { InferenceClient } from "@huggingface/inference";

export async function POST(request: Request) {
  try {
    const client = new InferenceClient(process.env.HF_TOKEN);

    const chatCompletion = await client.chatCompletion({
      provider: "hf-inference",
      model: "google/gemma-3-27b-it",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in one sentence." },
            {
              type: "image_url",
              image_url: {
                url: "https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg",
              },
            },
          ],
        },
      ],
    });

    return new Response(JSON.stringify({ answer: chatCompletion.choices[0].message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Hugging Face API 호출 실패:", error);
    return new Response(JSON.stringify({ error: "API 호출 실패" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
