"use client";

import { useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { fetchCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const setAuth = useSetAtom(authAtom);

  useEffect(() => {
    const login = async () => {
      // 토근 세션에 저장
      if (token) {
        sessionStorage.setItem("access_token", token);
        try {
          // 유저 정보를 받아서 authAtom 업데이트
          const user = await fetchCurrentUser(token);
          setAuth({
            isLoggedIn: true,
            user,
            token,
            hydrated: true,
          });

          console.log("로그인 성공", user);
          
        } catch {
          setAuth({
            isLoggedIn: false,
            user: null,
            token: null,
            hydrated: true,
          });
        }
        router.replace("/");
      }
    };

    login();
  }, [token, router, setAuth]);

  return <div>로그인 처리 중입니다...</div>;
}
