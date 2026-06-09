import { useEffect, useRef, useState } from "react";

type Props = {
  end: number;
  suffix?: string;
  duration?: number;
  delay?: number;
};

export default function AnimatedCounter({ end, suffix = "", duration = 2000, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [counted, setCounted] = useState(!globalThis.IntersectionObserver);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || counted) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || counted) return;
        setCounted(true);
        observer.unobserve(el);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [counted]);

  useEffect(() => {
    if (!counted) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime + delay;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => requestAnimationFrame(step), delay);
    return () => clearTimeout(timeout);
  }, [counted, end, duration, delay]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}
