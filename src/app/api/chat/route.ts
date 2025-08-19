import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const historyApiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
  const authHeader = req.headers.get("authorization");

  if (!historyApiBaseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
    return NextResponse.json(
      { message: "서버 구성 오류: History API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }

  try {
    const targetUrl = `${historyApiBaseUrl}/modelcall/history`;
    console.log("📡 Fetching chat history from:", targetUrl);

    const fastapiRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await fastapiRes.json();

    if (!fastapiRes.ok) {
      console.error(
        `❌ Error from external history API (${fastapiRes.status}):`,
        data
      );
      return NextResponse.json(data, { status: fastapiRes.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 History API Error:", error);
    return NextResponse.json(
      { message: "외부 history API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ragApiBaseUrl = process.env.MODEL_API_KEY;
  const historyApiBaseUrl = process.env.EXTERNAL_API_BASE_URL;
  const authHeader = req.headers.get("authorization");

  if (!ragApiBaseUrl) {
    console.error("Error: MODEL_API_KEY is not set in .env.local");
    return NextResponse.json(
      { message: "서버 구성 오류: RAG API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (!historyApiBaseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
    return NextResponse.json(
      { message: "서버 구성 오류: History API 기본 주소가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "multipart/form-data만 지원합니다." },
        { status: 415 }
      );
    }

    const formData = await req.formData();
    const question = formData.get("question");
    const image = formData.get("image");

    if (question === null && !image) {
      return NextResponse.json(
        { error: "텍스트 또는 이미지가 필요합니다." },
        { status: 400 }
      );
    }

    const targetUrl = `${ragApiBaseUrl}/rag/query`;
    console.log("📡 Proxying RAG request to:", targetUrl);

    const fastapiRes = await fetch(targetUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await fastapiRes.json();

    if (!fastapiRes.ok) {
      console.error(
        `❌ Error from external RAG API (${fastapiRes.status}):`,
        data
      );
      return NextResponse.json(data, { status: fastapiRes.status });
    }

    try {
      const saveChatUrl = `${historyApiBaseUrl}/modelcall/history`;
      const saveChatPayload = {
        user_message: question ? String(question) : null,
        ai_response: typeof data === 'string' ? data : JSON.stringify(data),
      };

      const saveChatRes = await fetch(saveChatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(saveChatPayload),
      });

      if (!saveChatRes.ok) {
        console.error(
          `❌ Error saving chat history (${saveChatRes.status}):`,
          await saveChatRes.json()
        );
      } else {
        console.log("✅ Chat history saved successfully.");
      }
    } catch (saveError) {
      console.error("🚨 Error during chat history save operation:", saveError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 RAG Proxy API Error:", error);
    return NextResponse.json(
      { message: "외부 RAG API 서버와 통신 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}
