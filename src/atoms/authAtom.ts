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
  hydrated: false,
};

export const authAtom = atom<AuthState>(initialState);