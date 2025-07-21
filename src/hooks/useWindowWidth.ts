import { useEffect, useState } from "react";

export const useWindowWidth = (breakpoint = 768) => {
  const isClient = typeof window !== "undefined";
  const [isMobile, setIsMobile] = useState(
    isClient ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (!isClient) return;
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint, isClient]);

  return isMobile;
};
