import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorizaion header missing" },
      { status: 401 }
    );
  }

  const res = await fetch(`${baseUrl}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.detail || "유저 정보 요청 실패" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
