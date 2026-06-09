import { type ReactNode, type MouseEvent, useCallback } from "react";

type Props = {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function ButtonRipple({ children, onClick, className = "", type = "button", disabled }: Props) {
  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);

    ripple.addEventListener("animationend", () => ripple.remove());

    onClick?.(e);
  }, [onClick]);

  return (
    <button
      type={type}
      className={`btn-ripple ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
