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
      <h1 className="text-2xl font-bold mb-6 text-blue-800">📒 오답노트</h1>

      {notes.length === 0 && (
        <p className="text-gray-600 text-center mt-8">저장된 오답이 없습니다.</p>
      )}

      <div className="space-y-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white border border-blue-100 rounded-xl shadow-sm p-5 space-y-4"
          >
            <p className="text-sm text-gray-500">
              저장일: {new Date(note.createdAt).toLocaleString()}
            </p>

            <div>
              <h2 className="text-blue-700 font-semibold mb-1">❓ 문제</h2>
              <div className="bg-gray-50 border rounded p-3 text-gray-800 whitespace-pre-wrap">
                {note.question}
              </div>
            </div>

            <div>
              <h2 className="text-green-700 font-semibold mb-1">✅ 해설</h2>
              <div className="bg-blue-50 border rounded p-3 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                {note.explanation}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleDelete(note.id)}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                🗑 삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
