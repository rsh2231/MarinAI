import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarinAI",
  description: "해기사 시험 대비 지능형 QA 튜터 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.className} bg-background-dark text-foreground-dark transition-colors duration-300 overflow-x-hidden`}
      >
        <Layout>{children}</Layout>
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          closeOnClick
          draggable={false}
          pauseOnHover={false}
          theme="dark"
        />
      </body>
    </html>
  );
}
