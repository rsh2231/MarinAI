type HamburgerButtonProps = {
  onClick: () => void;
  className?: string;
};

export default function HamburgerButton({ onClick, className }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-blue-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
