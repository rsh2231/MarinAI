import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${baseUrl}/results/${id}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || "결과 상세 정보 요청 실패" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching result details:", error);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
