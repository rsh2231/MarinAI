"use client";

import { useEffect, useState } from "react";
import { getWrongNotes, deleteWrongNote } from "@/utils/localWrongNote";
import { WrongNote } from "@/types/wrongNote";

export default function NotePage() {
  const [notes, setNotes] = useState<WrongNote[]>([]);

  useEffect(() => {
    setNotes(getWrongNotes());
  }, []);

  const handleDelete = (id: string) => {
    deleteWrongNote(id);
    setNotes(getWrongNotes());
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📒 오답노트</h1>

      {notes.length === 0 && <p>저장된 오답이 없습니다.</p>}

      {notes.map((note) => (
        <div key={note.id} className="mb-4 bg-gray-100 p-4 rounded shadow">
          <p className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleString()}</p>
          <h2 className="font-semibold mt-2">문제</h2>
          <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1">{note.question}</pre>

          <h2 className="font-semibold mt-4">해설</h2>
          <pre className="whitespace-pre-wrap bg-white p-2 rounded mt-1 text-sm">{note.explanation}</pre>

          <button
            onClick={() => handleDelete(note.id)}
            className="mt-2 text-red-600 hover:underline text-sm"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
