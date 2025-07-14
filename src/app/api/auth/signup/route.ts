import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const baseUrl = process.env.EXTERNAL_API_BASE_URL;
    const body = await req.json();

    const res = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail }, { status: res.status });

    return NextResponse.json(data);
}
