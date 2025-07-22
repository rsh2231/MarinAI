"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // 토큰 저장
      sessionStorage.setItem("access_token", token);
      // Home으로 이동
      router.replace("/");
    }
  }, [token, router]);

  return <div>로그인 처리 중입니다...</div>;
} 