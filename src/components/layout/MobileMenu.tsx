'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
};

type MobileMenuProps = {
  navItems: NavItem[];
  pathname: string;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
};

export default function MobileMenu({
  navItems,
  pathname,
  onClose,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
}: MobileMenuProps) {
  const handleAuthClick = () => {
    if (isLoggedIn) {
      onLogoutClick();
    } else {
      onLoginClick();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {/* 오버레이 */}
      <motion.div
        key="overlay"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* 하단 슬라이드업 시트 */}
      <motion.div
        key="menu"
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 inset-x-0 z-50 bg-[#1A1A1A] border-t border-gray-700 rounded-t-2xl px-5 py-6 shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-end  items-center mb-6">
          <button onClick={onClose} aria-label="Close menu" className="p-1">
            <X className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
        
        {/* 네비게이션 */}
        <nav className="flex flex-col items-end space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, ease: 'easeOut' }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`text-lg px-4 py-3 rounded-lg transition-colors duration-200 ${pathname.startsWith(item.href)
                  ? 'bg-primary text-white font-semibold'
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}

          {/* 마이페이지 */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.05 * navItems.length,
                ease: 'easeOut',
              }}
            >
              <Link
                href="/mypage"
                onClick={onClose}
                className="text-lg px-4 py-3 rounded-lg text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                마이페이지
              </Link>
            </motion.div>
          )}
        </nav>

        {/* 로그인/로그아웃 버튼 */}
        <div className="mt-6 border-t border-gray-700 pt-4 flex justify-end">
          <button
            onClick={handleAuthClick}
            className={`px-4 py-3 rounded-lg text-lg transition-colors duration-200 ${isLoggedIn
              ? 'text-red-400 hover:bg-red-500/10'
              : 'text-gray-200 hover:bg-gray-700'
              }`}
          >
            {isLoggedIn ? '로그아웃' : '로그인'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}