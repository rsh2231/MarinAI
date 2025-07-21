import { NextResponse } from "next/server";

export async function GET() {
    // FastAPI OAuth 시작 주소로 리다이렉트
    const baseUrl = process.env.EXTERNAL_API_BASE_URL;
    return NextResponse.redirect(`${baseUrl}/auth/login/google`);
}
