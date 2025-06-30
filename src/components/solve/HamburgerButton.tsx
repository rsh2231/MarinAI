type HamburgerButtonProps = {
  onClick: () => void;
  className?: string;
};

export default function HamburgerButton({
  onClick,
  className,
}: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`md:hidden fixed top-4 left-30 z-50 p-2 rounded-xl border border-gray-600
                 bg-[var(--background-dark)] text-[var(--foreground-dark)]
                 hover:bg-[#1e293b] transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                 shadow-lg backdrop-blur-sm ${className ?? ""}`}
      aria-label="사이드바 열기"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
