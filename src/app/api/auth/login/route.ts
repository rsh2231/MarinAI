import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const baseUrl = process.env.EXTERNAL_API_BASE_URL;
  const { username, password } = await req.json();

  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${baseUrl}/auth/token`, {
    method: "POST",
    body: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.detail }, { status: res.status });

  return NextResponse.json(data);
}
