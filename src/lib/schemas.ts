import { z } from 'zod';

// 로그인 폼 유효성 검사 스키마
export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

// 회원가입 폼 유효성 검사 스키마
export const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력해주세요.').max(20, '이름은 20자를 초과할 수 없습니다.'),
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  // 여기에 '비밀번호 확인' 필드를 추가하고 싶다면 .refine()을 사용할 수 있습니다.
});

// Zod 스키마로부터 TypeScript 타입 추론
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;