"use client";

import "../styles/globals.css";
import Layout from "@/components/layout/Layout";
import Providers from "@/components/ui/Providers";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import AuthInit from "@/components/auth/AuthInit";

const inter = Inter({ 
  subsets: ["latin"],
  preload: false, // preload 경고 방지
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <title>MarinAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.className} h-full bg-background-dark text-foreground-dark transition-colors duration-300`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <AuthInit />
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}