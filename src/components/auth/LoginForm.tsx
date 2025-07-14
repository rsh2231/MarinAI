"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { loginViaNext } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/lib/schemas";

// 로그인 성공 시 모달을 닫기 위해 부모로부터 함수를 props로 받습니다.
type LoginFormProps = {
  onLoginSuccess: () => void;
};

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const setAuth = useSetAtom(authAtom);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // Zod 스키마 연동
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginViaNext(data.email, data.password);
      setAuth({ isLoggedIn: true, user: result.user });
      onLoginSuccess(); // 부모에게 성공을 알림 (모달 닫기)
    } catch (err: any) {
      // 서버에서 발생한 에러를 폼 전체에 표시
      setError("root", {
        type: "manual",
        message: err.message || "로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="이메일"
          className={`w-full bg-secondary/30 border px-4 py-3 rounded text-foreground-dark placeholder-secondary focus:outline-none focus:ring-2 transition-shadow ${
            errors.email ? 'border-danger focus:ring-danger' : 'border-secondary/50 focus:ring-primary'
          }`}
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>
      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="비밀번호"
          className={`w-full bg-secondary/30 border px-4 py-3 rounded text-foreground-dark placeholder-secondary focus:outline-none focus:ring-2 transition-shadow ${
            errors.password ? 'border-danger focus:ring-danger' : 'border-secondary/50 focus:ring-primary'
          }`}
        />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>

      {errors.root && <p className="text-sm text-danger text-center">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting} // 제출 중 비활성화
        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}