"use client";

import { useEffect, useState } from "react";

export function TimerComponent() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;

  return (
    <span className="text-blue-400 font-mono">
      ⏱ {String(minutes).padStart(2, "0")}:{String(remSeconds).padStart(2, "0")}
    </span>
  );
}
