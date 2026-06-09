import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const hasIO = typeof IntersectionObserver !== "undefined";
  const [visible, setVisible] = useState(!hasIO);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasIO) return;
    const fallback = window.setTimeout(() => setVisible(true), delay + 900);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
