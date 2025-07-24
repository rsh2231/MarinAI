import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { timeLeftAtom, showResultAtom } from "@/atoms/examAtoms";

export function useExamTimer(onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const showResult = useAtomValue(showResultAtom);

  useEffect(() => {
    if (showResult || timeLeft <= 0) {
        return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timerId);
          onTimeUp(); // 시간이 다 되면 콜백 실행
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showResult, setTimeLeft, onTimeUp]);
}