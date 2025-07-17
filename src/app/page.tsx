"use client";

import HomePageHeader from "@/components/home/HomePageHeader";
import ChatForm from "@/components/home/ChatForm";

export default function Home() {
  return (
    <div className="mx-auto flex h-full flex-col justify-center items-center w-full max-w-2xl text-center px-4">
      <HomePageHeader />
      <ChatForm />
    </div>
  );
}