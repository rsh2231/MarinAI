import { error } from "console";
import type { SignupFormData } from "./schemas";

export async function signupViaNext(data: SignupFormData) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "회원가입에 실패했습니다.");
  }

  return res.json();
}

export async function loginViaNext(username: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchCurrentUser(token: string) {
  const res = await fetch("api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("사용자 정보를 불러오지 못했습니다.");
  }

  return res.json();
}
