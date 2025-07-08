'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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
    <>
      {/* 오버레이 */}
      <motion.div
        className="fixed inset-0 bg-black/60 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* 드롭다운 메뉴 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="fixed top-14 right-0 w-full bg-[#121212] z-50 border-t border-gray-700 px-4 py-4 space-y-3 shadow-xl rounded-b-xl"
      >
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <Link
              href={item.href}
              onClick={() => {
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`block text-right px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
