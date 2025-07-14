import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> } // Promise 타입으로 변경
) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;
  if (!baseUrl) {
    return new NextResponse("서버 설정 오류", { status: 500 });
  }

  // params를 await 해야 합니다
  const { slug } = await params;
  if (!slug || !Array.isArray(slug)) {
    return new NextResponse("잘못된 이미지 경로입니다.", { status: 400 });
  }

  const imagePath = slug.map((segment) => encodeURIComponent(segment)).join("/");
  const targetUrl = `${baseUrl}/solve/img/${imagePath}`;

  try {
    const imageResponse = await fetch(targetUrl, {
      method: "GET",
      cache: "force-cache",
    });

    if (!imageResponse.ok) {
      return new NextResponse(imageResponse.body, {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
      });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      imageResponse.headers.get("Content-Type") || "image/png"
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(imageResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("이미지 프록시 요청 오류:", error);
    return new NextResponse("이미지 요청 중 서버 오류 발생", { status: 502 });
  }
}