import { usePathname } from "next/navigation";
import Header from "./Header";
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMyPage = pathname.startsWith("/mypage");
  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <Header />
      <main className={`flex-1${isMyPage ? "" : " overflow-hidden"}`}>
        {children}
      </main>
    </div>
  );
}