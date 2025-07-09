import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  // 파일 데이터를 buffer로 변환
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 고유한 파일 이름 생성 (타임스탬프 + 원본 파일명)
  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  // 파일을 저장할 경로. /public 폴더 내에 저장해야 외부에서 접근 가능
  const path = join(process.cwd(), "public", "uploads", filename);

  try {
    // 지정된 경로에 파일 쓰기
    await writeFile(path, buffer);
    console.log(`파일 저장 완료: ${path}`);

    // 클라이언트에게 반환할 URL 생성 (/uploads/filename.jpg)
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error("파일 저장 중 오류 발생:", error);
    return NextResponse.json({ error: "파일 저장에 실패했습니다." }, { status: 500 });
  }
}