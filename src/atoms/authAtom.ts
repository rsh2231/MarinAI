import { atom } from "jotai";

interface User {
  id: string;
  username: string;
  indivname: string; // 표시될 이름
  avatarUrl?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  hydrated: boolean; // sessionStorage에서 상태를 복원했는지 여부
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
  hydrated: false,  // 인증 상태가 확정/동기화 되었는지
};

export const authAtom = atom<AuthState>(initialState);