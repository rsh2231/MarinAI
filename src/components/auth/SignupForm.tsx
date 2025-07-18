"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupViaNext } from "@/lib/auth";
import { signupSchema, type SignupFormData } from "@/lib/schemas";
import { useState } from "react";

type SignupFormProps = {
  onSignupSuccess: () => void;
};

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signupViaNext(data);
      setSuccess("회원가입이 완료되었습니다! 로그인 해주세요.");
      setTimeout(() => {
        onSignupSuccess(); // 1.5초 후 부모에게 성공을 알려 로그인 폼으로 전환
      }, 1500);
    } catch (err: any) {
      setError("root", {
        message: "회원가입에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("indivname")}
          type="text"
          placeholder="이름"
          className={`w-full bg-secondary/30 border px-4 py-3 rounded text-foreground-dark placeholder-secondary focus:outline-none focus:ring-2 transition-shadow ${
            errors.indivname
              ? "border-danger focus:ring-danger"
              : "border-secondary/50 focus:ring-primary"
          }`}
        />
        {errors.indivname && (
          <p className="mt-1 text-sm text-danger">{errors.indivname.message}</p>
        )}
      </div>
      <div>
        <input
          {...register("username")}
          type="email"
          placeholder="이메일"
          className={`w-full bg-secondary/30 border px-4 py-3 rounded text-foreground-dark placeholder-secondary focus:outline-none focus:ring-2 transition-shadow ${
            errors.username
              ? "border-danger focus:ring-danger"
              : "border-secondary/50 focus:ring-primary"
          }`}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-danger">{errors.username.message}</p>
        )}
      </div>
      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="비밀번호 (8자 이상)"
          className={`w-full bg-secondary/30 border px-4 py-3 rounded text-foreground-dark placeholder-secondary focus:outline-none focus:ring-2 transition-shadow ${
            errors.password
              ? "border-danger focus:ring-danger"
              : "border-secondary/50 focus:ring-primary"
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-danger">{errors.root.message}</p>
      )}
      {success && <p className="text-sm text-success">{success}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !!success}
        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
      >
        {isSubmitting ? "가입 처리 중..." : "회원가입"}
      </button>
    </form>
  );
}
