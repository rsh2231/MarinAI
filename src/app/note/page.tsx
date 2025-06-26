"use client";

import { useEffect, useState } from "react";
import { loadWrongNotes, deleteWrongNote } from "@/utils/localWrongNote";
import { WrongNote } from "@/types/wrongNote";
import { motion } from "framer-motion";

export default function NotePage() {
  const [notes, setNotes] = useState<WrongNote[]>([]);

  useEffect(() => {
    setNotes(loadWrongNotes());
  }, []);

  const handleDelete = (id: string) => {
    deleteWrongNote(id);
    setNotes(loadWrongNotes());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen bg-[#1e293b] text-white"
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-8 select-none">
        오답노트
      </h1>

      {notes.length === 0 && (
        <p className="text-gray-400 text-center mt-12">저장된 오답이 없습니다.</p>
      )}

      <div className="space-y-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-[#273449] border border-gray-700 rounded-xl shadow-md p-5 space-y-4 transition hover:shadow-lg"
          >
            <p className="text-xs text-gray-400">
              저장일: {new Date(note.createdAt).toLocaleString()}
            </p>

            <div>
              <h2 className="text-blue-400 font-semibold mb-1 text-sm">❓ 문제</h2>
              <div className="bg-[#1e293b] border border-gray-700 rounded p-3 text-gray-200 whitespace-pre-wrap text-sm">
                {note.question}
              </div>
            </div>

            <div>
              <h2 className="text-green-400 font-semibold mb-1 text-sm">✅ 해설</h2>
              <div className="bg-[#1e2a36] border border-gray-700 rounded p-3 text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                {note.explanation}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleDelete(note.id)}
                className="text-sm text-red-400 hover:text-red-300 hover:underline transition"
              >
                🗑 삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
