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

// 해기사 시험 관련 시스템 프롬프트
const MARITIME_SYSTEM_PROMPT = `
당신은 해기사 시험 전문 AI 어시스턴트입니다. 
다음 규칙을 반드시 따라야 합니다:

1. 오직 해기사 시험과 관련된 내용만 답변합니다.
2. 해기사 시험 관련 주제:
   - 항해학 (Navigation)
   - 해사법규 (Maritime Law)
   - 선박운용학 (Ship Operations)
   - 해상교통안전법 (Maritime Traffic Safety)
   - 선박안전법 (Ship Safety Law)
   - 해상충돌예방법 (COLREG)
   - 무선통신 (Radio Communication)
   - 기관학 (Marine Engineering)
   - 해양기상학 (Marine Meteorology)
   - 해도학 (Chart Work)
   - 전자항법 (Electronic Navigation)
   - 해상안전 (Maritime Safety)
   - 해양오염방지 (Marine Pollution Prevention)
   - 해사영어 (Maritime English)
   - 해운경영 (Shipping Management)
   - 해양환경보호 (Marine Environmental Protection)

3. 해기사 시험과 관련 없는 질문에는 다음과 같이 답변합니다:
   "죄송합니다. 저는 해기사 시험 관련 내용만 답변할 수 있습니다. 해기사 시험과 관련된 질문이 있으시면 언제든지 물어보세요."

4. 답변은 정확하고 체계적으로 제공합니다.
5. 필요시 관련 법규나 규정을 인용합니다.
6. 실무 경험과 연계한 설명을 제공합니다.
`;

// 사용자 메시지를 해기사 시험 컨텍스트로 래핑하는 함수
function wrapUserMessage(userMessage: string): string {
  return `
해기사 시험 관련 질문: ${userMessage}

위 질문이 해기사 시험과 관련이 있다면 상세히 답변해주세요.
해기사 시험과 관련이 없다면 정중히 거절해주세요.
`;
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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: MARITIME_SYSTEM_PROMPT // 시스템 프롬프트 추가
    });

    const promptParts: any[] = [];
    
    // 사용자 메시지를 해기사 시험 컨텍스트로 래핑
    if (message) {
      promptParts.push({ text: wrapUserMessage(message) });
    }
    
    if (imagePart) {
      promptParts.push(imagePart);
      // 이미지가 있을 때도 해기사 시험 관련 컨텍스트 추가
      if (!message) {
        promptParts.push({ 
          text: "이 이미지가 해기사 시험과 관련된 내용인지 확인하고, 관련이 있다면 설명해주세요. 관련이 없다면 정중히 거절해주세요." 
        });
      }
    }

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