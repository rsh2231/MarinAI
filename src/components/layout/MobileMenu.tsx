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
};

export default function MobileMenu({ navItems, pathname, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {/* 오버레이 */}
      <motion.div
        key="overlay"
        className="fixed inset-0 bg-black/50 z-40"
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
        {/* 상단 닫기 버튼 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">메뉴</span>
          <button onClick={onClose} aria-label="Close menu">
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <nav className="flex flex-col items-end space-y-3">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link
                href={item.href}
                onClick={() => {
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`block text-lg px-3 py-3 rounded-xl transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    </AnimatePresence>
  );
}
