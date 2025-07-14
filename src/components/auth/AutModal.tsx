"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import OAuthButton from "./OAuthButton";

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  // 모달이 닫힐 때 기본 모드를 '로그인'으로 초기화
  const handleClose = () => {
    setMode("login");
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        // 1. 모달 배경(오버레이) 애니메이션
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose} // 배경 클릭 시 닫기
          className="fixed inset-0 z-50 bg-gray-900/60 flex items-center justify-center px-4 backdrop-blur-sm"
        >
          {/* 2. 모달 패널 자체의 애니메이션 */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히는 것 방지
            className="bg-background-dark rounded-lg shadow-card p-8 w-full max-w-md relative text-foreground-dark"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-secondary hover:text-foreground-dark transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              {mode === "login" ? "로그인" : "회원가입"}
            </h2>

            {/* 3. 로그인/회원가입 폼 전환 애니메이션 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode} // 'login' 또는 'signup'으로 키가 바뀌면 애니메이션 트리거
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {mode === "login" ? <LoginForm onLoginSuccess={handleClose} /> : <SignupForm onSignupSuccess={() => setMode('login') }/>}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 text-center text-sm">
              {mode === "login" ? (
                <>
                  계정이 없으신가요?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary-light font-semibold hover:underline cursor-pointer">
                    회원가입
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{" "}
                  <button onClick={() => setMode("login")} className="text-primary-light font-semibold hover:underline cursor-pointer">
                    로그인
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-secondary/50" />
                <span className="mx-4 text-xs text-secondary">또는</span>
                <hr className="flex-grow border-t border-secondary/50" />
            </div>

            <OAuthButton />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}