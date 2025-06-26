"use client";

import React from "react";

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
    <div className={`mb-6 ${className}`}>
      <label htmlFor={id} className="block mb-2 font-semibold text-gray-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full p-3 bg-[#273449] border border-gray-700 rounded-md shadow-sm
          text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition
        `}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#273449] text-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
