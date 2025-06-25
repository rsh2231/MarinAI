import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "해기사 GPT Q&A",
  description: "해기사 시험 대비 GPT 기반 질의응답/문제풀이 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-sky-50`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
