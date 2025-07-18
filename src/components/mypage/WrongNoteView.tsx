"use client";
import { BookX, ChevronRight } from "lucide-react";
import Link from 'next/link';

const dummyNotes = [
  { id: 1, title: '2023년 4회차 항해술 오답', date: '2025-07-15' },
  { id: 2, title: '해사법규 중요 판례 정리', date: '2025-07-12' },
  { id: 3, title: '선박 기관 파트 오답 모음', date: '2025-07-10' },
];

export default function WrongNoteView() {
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookX size={22} />최근 오답노트
      </h3>
      <ul className="space-y-3">
        {dummyNotes.map(note => (
          <li key={note.id} className="flex justify-between items-center p-3 bg-neutral-700/50 rounded-md hover:bg-neutral-700 transition-colors">
            <div>
              <p className="font-semibold">{note.title}</p>
              <p className="text-xs text-neutral-400">{note.date}</p>
            </div>
            <ChevronRight size={20} className="text-neutral-500" />
          </li>
        ))}
      </ul>
      <div className="text-right mt-4">
        <Link href="/wrong-note" className="text-sm text-blue-400 hover:text-blue-300">
          전체 오답노트 보기 →
        </Link>
      </div>
    </div>
  );
}