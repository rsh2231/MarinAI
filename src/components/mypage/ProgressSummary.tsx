"use client";
import { Target } from "lucide-react";

export default function ProgressSummary() {
  const progress = 75; // 임시 진행률
  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
       <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Target size={20} /> 전체 학습 진행률
      </h3>
      <div className="w-full bg-neutral-700 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-right mt-2 font-bold text-lg">{progress}%</p>
    </div>
  );
}