import React from "react";

interface LoadingSpinnerProps {
  text?: string;
  minHeight?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ 
  text = "로딩 중입니다...", 
  minHeight = "60vh",
  size = "md"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5", 
    lg: "h-8 w-8"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div
      className="flex justify-center items-center text-foreground/70"
      style={{ minHeight }}
    >
      <svg
        className={`animate-spin -ml-1 mr-3 text-blue-500 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <span className={textSizes[size]}>{text}</span>}
    </div>
  );
} 