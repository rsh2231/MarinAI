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
    focus:outline-none
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantStyles = {
    primary: `
      bg-blue-600 text-white border-transparent
      hover:bg-blue-700
    `, 
    secondary: `
      bg-gray-100 text-gray-900 border-gray-300
      hover:bg-gray-200
    `,
    neutral: `
      bg-[#1f2937] text-gray-100 border-[#374151]
      hover:bg-[#374151]
    `,
  };

  const selectedStyles = {
    primary: "",
    secondary: "",
    neutral: "",
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
