"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { fetchCurrentUser } from "@/lib/auth";

export default function AuthInit() {
  const setAuth = useSetAtom(authAtom);

  useEffect(() => {
    const rehydrate = async () => {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setAuth((prev) => ({ ...prev, hydrated: true }));
        return;
      }

      try {
        const user = await fetchCurrentUser(token);
        setAuth({
          isLoggedIn: true,
          user,
          token,
          hydrated: true,
        });
      } catch (error) {
        console.error("Auth token is invalid, logging out.", error);
        sessionStorage.removeItem("access_token"); // 유효하지 않으면 삭제
        setAuth({
          isLoggedIn: false,
          user: null,
          token: null,
          hydrated: true, // 실패 시에도 hydrated를 true로 설정
        });
      }
    };

    rehydrate();
  }, []);

  return null;
}
