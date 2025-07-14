import { atom } from "jotai";

interface User {
  id: string;
  email: string;
  name: string;
}

export const authAtom = atom<{
  isLoggedIn: boolean;
  user: User | null;
}>({
  isLoggedIn: false,
  user: null,
});
