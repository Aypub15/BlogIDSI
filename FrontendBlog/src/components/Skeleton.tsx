import type { ReactNode } from "react";

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line w-40" />
        <div className="skeleton-line w-70" />
        <div className="skeleton-line w-90" />
        <div className="skeleton-line w-50" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

type SuspenseProps = {
  loading: boolean;
  children: ReactNode;
  count?: number;
};

export function SuspenseGrid({ loading, children, count }: SuspenseProps) {
  if (loading) return <SkeletonGrid count={count} />;
  return <>{children}</>;
}
