import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

// ArrayBuffer를 Base64로 변환하는 헬퍼 함수 (Edge Runtime 호환)
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 파일(Blob/File)을 Gemini API가 요구하는 형식으로 변환하는 함수
async function fileToGenerativePart(file: Blob) {
  const arrayBuffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: arrayBufferToBase64(arrayBuffer),
      mimeType: file.type,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let message: string = "";
    let imagePart: any = null;

    // ✅ Content-Type에 따라 요청 본문 처리 방식을 분기
    if (contentType.includes("application/json")) {
      const body = await req.json();
      message = body.message || "";
      const imageUrl = body.imageUrl;

      // imageUrl이 있다면, 서버에서 직접 이미지를 가져와 처리
      if (imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
        }
        const imageBlob = await imageResponse.blob();
        imagePart = await fileToGenerativePart(imageBlob);
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const messageValue = formData.get("message");
      const imageValue = formData.get("image");

      message = typeof messageValue === "string" ? messageValue : "";
      const imageFile = imageValue instanceof File ? imageValue : null;
      
      if (imageFile) {
        imagePart = await fileToGenerativePart(imageFile);
      }
    } else {
      return new Response(JSON.stringify({ error: "Unsupported Content-Type" }), {
        status: 415,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!message && !imagePart) {
      return new Response(JSON.stringify({ error: "텍스트 또는 이미지가 필요합니다." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API 키가 설정되지 않았습니다." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // gemini-1.5-flash 권장

    const promptParts: any[] = [];
    if (message) promptParts.push({ text: message }); // 텍스트도 객체 형태로 전달
    if (imagePart) promptParts.push(imagePart);

    const result = await model.generateContentStream(promptParts);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            // chunk.text()가 존재하고 비어있지 않은지 확인
            if (chunk && typeof chunk.text === 'function') {
                const text = chunk.text();
                if (text) {
                    controller.enqueue(encoder.encode(text));
                }
            }
          }
          controller.close();
        } catch (err) {
          console.error("스트림 처리 중 오류:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Gemini 스트리밍 오류:", error);
    return new Response(
      JSON.stringify({ error: "AI 응답 생성 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}