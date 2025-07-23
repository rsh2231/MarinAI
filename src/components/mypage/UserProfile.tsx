"use client";

import { useAtomValue } from "jotai";
import { authAtom } from "@/atoms/authAtom";
import { User, Mail, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UserProfile() {
  // Jotai Atom에서 인증 상태를 읽어옴
  const auth = useAtomValue(authAtom);

  if (!auth.hydrated) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-neutral-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // 비로그인 상태일 때
  if (!auth.isLoggedIn || !auth.user) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg text-center">
        <p className="mb-4">서비스를 이용하려면 로그인이 필요합니다.</p>
        <Link href="/login" passHref>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 w-full transition-colors">
            <LogIn size={18} />
            로그인 페이지로
          </button>
        </Link>
      </div>
    );
  }

  // 로그인된 상태일 때
  return (
    <div className="bg-neutral-800 p-3 sm:p-6 rounded-lg shadow-lg flex flex-row items-center gap-2 sm:gap-4">
      {auth.user.profile_img_url && auth.user.profile_img_url.includes("googleusercontent.com") ? (
        <Image
          src={auth.user.profile_img_url}
          alt="User Avatar"
          width={64}
          height={64}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-500"
        />
      ) : (
        <img
          src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${auth.user.indivname}`}
          alt="User Avatar"
          width={64}
          height={64}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-500"
        />
      )}
      <div className="flex-1 text-left">
        <h3 className="text-base sm:text-xl font-bold flex items-center gap-1 sm:gap-2">
          <User size={16} className="sm:w-5 sm:h-5" />
          {auth.user.indivname}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-1 sm:gap-2 mt-1">
          <Mail size={12} className="sm:w-3.5 sm:h-3.5" />
          {auth.user.username}
        </p>
      </div>
    </div>
  );
}
