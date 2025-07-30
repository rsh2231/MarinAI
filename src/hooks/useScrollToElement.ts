import { useEffect, useRef } from "react";

export function useScrollToElement<T extends HTMLElement>(
  shouldScroll: boolean,
  delay: number = 300
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (shouldScroll && elementRef.current) {
      const timer = setTimeout(() => {
        elementRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [shouldScroll, delay]);

  return elementRef;
} 