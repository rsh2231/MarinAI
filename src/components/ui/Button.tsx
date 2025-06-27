import React from "react";

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "neutral";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  selected?: boolean; 
  className?: string;
};

export default function Button({
  onClick,
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  selected = false,
  className = "",
}: ButtonProps) {
  const baseStyle = `
    inline-flex items-center justify-center
    font-medium rounded-md border
    transition-transform duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantStyles = {
    // 파란 배경, 흰 글자 -> 강조용 버튼
    primary: `
      bg-blue-600 text-white border-transparent
      hover:bg-blue-700 focus:ring-blue-500
    `, 
    // 밝은 회색 배경 -> 취소/뒤로 등
    secondary: `
      bg-gray-100 text-gray-900 border-gray-300
      hover:bg-gray-200 focus:ring-gray-400
    `,
    // 어두운 배경, 흰 글자 -> 차분하고 기능적
    neutral: `
      bg-[#1f2937] text-gray-100 border-[#374151]
      hover:bg-[#374151] focus:ring-gray-600
    `,
  };

  const selectedStyles = {
    primary: "ring-2 ring-blue-300",
    secondary: "ring-2 ring-gray-300 bg-gray-200",
    neutral: "ring-2 ring-blue-600 bg-[#2e3a4a]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        ${baseStyle}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${selected ? selectedStyles[variant] : ""}
        ${!disabled && "hover:scale-[1.03]"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
