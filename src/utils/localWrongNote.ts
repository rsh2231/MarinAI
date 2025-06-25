import { WrongNote } from "@/types/wrongNote";

const STORAGE_KEY = "wrong_notes";

export function getWrongNotes(): WrongNote[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWrongNote(note: WrongNote) {
  const notes = getWrongNotes();
  const updated = [note, ...notes];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteWrongNote(id: string) {
  const notes = getWrongNotes();
  const updated = notes.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
