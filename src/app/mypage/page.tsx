// app/mypage/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { useEffect } from "react";
import MyPageClient from "./components/MyPageClient";

export default function MyPage() {
  const router = useRouter();
  const auth = useAtomValue(authAtom);

  useEffect(() => {
    // 인증되지 않은 사용자는 즉시 리다이렉트
    if (!auth.isLoggedIn) {
      router.replace("/");
    }
  }, [auth.isLoggedIn, router]);

  // 인증되지 않았다면 아무것도 렌더링하지 않음 (리다이렉션이 실행될 때까지)
  if (!auth.isLoggedIn) {
    return null;
  }

  // 인증되었다면, 실제 페이지 UI를 담은 클라이언트 컴포넌트를 렌더링
  return <MyPageClient />;
}
