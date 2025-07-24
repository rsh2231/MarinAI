// app/mypage/_components/MyPageHeader.tsx
import UserProfile from "@/components/mypage/header/UserProfile";

export default function MyPageHeader() {
  return (
    <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 min-h-24">
      <div className="flex flex-col justify-center h-full text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          마이페이지
        </h1>
        <p className="text-neutral-400 mt-1 sm:mt-2 text-sm sm:text-base">
          나의 학습 현황을 한눈에 확인하세요.
        </p>
      </div>
      <div className="flex justify-center sm:block">
        <UserProfile />
      </div>
    </header>
  );
}
