import { useSession } from "next-auth/react";

const { data: session } = useSession();
const userEmail = session?.user?.email;

const handleSaveResult = async () => {
  await fetch("/api/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userEmail,
      result: {
        questions: groupedQuestions,
        answers,
        score: chartData,
        date: new Date().toISOString(),
      },
    }),
  });
};
