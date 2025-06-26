import { WrongNote } from "@/types/wrongNote";

export const saveWrongNote = (note: WrongNote) => {
  const notes = loadWrongNotes();
  notes.push(note);
  localStorage.setItem("wrongNotes", JSON.stringify(notes));
};

export const loadWrongNotes = (): WrongNote[] => {
  if (typeof window === "undefined") return [];
  const notes = localStorage.getItem("wrongNotes");
  return notes ? JSON.parse(notes) : [];
};
