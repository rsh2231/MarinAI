"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

type SelectBoxProps = {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
  className?: string;
};

export default function SelectBox({
  label,
  id,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
}: SelectBoxProps) {
  return (
    <div className={`relative mb-4 ${className}`}>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-semibold text-gray-300"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full appearance-none bg-[#273449] text-white text-sm
            border border-gray-700 rounded-md px-4 py-3 pr-10
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#273449] text-white">
              {opt}
            </option>
          ))}
        </select>

        {/* 아래 화살표 아이콘 (lucide-react 필요) */}
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
