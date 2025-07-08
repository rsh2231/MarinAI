import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarinAI",
  description: "해기사 시험 대비 지능형 QA 튜터 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.className} bg-background-dark text-foreground-dark transition-colors duration-300 overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <Providers >
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
