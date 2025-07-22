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

  return (
    <div className="flex justify-center items-center min-h-[60vh] text-foreground/70">
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>로그인 처리 중입니다...</span>
    </div>
  );
}
