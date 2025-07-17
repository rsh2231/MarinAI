"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { fetchCurrentUser } from "@/lib/auth";

export default function AuthInit() {
  const setAuth = useSetAtom(authAtom);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;

    fetchCurrentUser(token)
      .then((user) => {
        setAuth({
          isLoggedIn: true,
          user,
          token,
        });
      })
      .catch(() => {
        sessionStorage.removeItem("access_token"); // 유효하지 않으면 삭제
      });
  }, []);

  return null;
}
