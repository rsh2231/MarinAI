import React from "react";

type ButtonProps = {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  color?: "blue" | "green" | "gray";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
};

export default function Button({
  selected = false,
  onClick,
  children,
  color = "blue",
  size = "md",
  disabled = false,
  className = "",
}: ButtonProps) {
  const colors = {
    blue: selected
      ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
      : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50",
    green: selected
      ? "bg-green-600 text-white border-green-600 shadow-md ring-2 ring-green-300"
      : "bg-white text-green-700 border-green-300 hover:bg-green-50",
    gray: selected
      ? "bg-gray-600 text-white border-gray-600 shadow-md ring-2 ring-gray-300"
      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1 rounded-lg text-sm",
    md: "px-4 py-2 rounded-lg text-sm",
    lg: "px-5 py-2.5 rounded-lg text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`
        ${sizes[size]} 
        border font-medium transition 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${colors[color]} 
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"} 
        ${className}
      `}
      type="button"
    >
      {children}
    </button>
  );
}
