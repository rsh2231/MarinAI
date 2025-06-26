import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "해기사 GPT Q&A",
  description: "LLM 기반 해기사 시험 질의응답/문제풀이 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${inter.className} bg-background text-foreground transition-colors duration-300`}
      >
        <Layout>{children}</Layout>
        <ToastContainer
          position="top-center"
          autoClose={800}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </body>
    </html>
  );
}