import { WrongNote } from "@/types/wrongNote";

const STORAGE_KEY = "wrongNotes";

// 저장
export const saveWrongNote = (note: WrongNote) => {
  const notes = loadWrongNotes();
  notes.push(note);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

// 불러오기
export const loadWrongNotes = (): WrongNote[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

// 삭제
export const deleteWrongNote = (id: string) => {
  const notes = loadWrongNotes();
  const filtered = notes.filter((note) => note.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
