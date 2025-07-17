import { atom } from "jotai";

interface User {
  id: string;
  username: string;
  indivname: string;
}

export const authAtom = atom<{
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}>({
  isLoggedIn: false,
  user: null,
  token: null,
});
