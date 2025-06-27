import ScrollToTopButton from "../ui/ScrollToTopButton";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <ScrollToTopButton />
    </div>
  );
}
