import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'card';
  width?: string;
  height?: string;
  lines?: number;
}

export function Skeleton({ className, variant = 'rect', width, height, lines = 1 }: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div className={clsx('space-y-2', className)} role="status" aria-label="लोड होत आहे">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-pulse rounded h-4"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={clsx('rounded-xl bg-surface-card p-4 shadow-md space-y-3', className)} role="status" aria-label="लोड होत आहे">
        <div className="skeleton-pulse rounded h-6 w-2/3" />
        <div className="skeleton-pulse rounded h-4 w-full" />
        <div className="skeleton-pulse rounded h-4 w-4/5" />
        <div className="flex gap-3 pt-2">
          <div className="skeleton-pulse rounded-lg min-h-[56px] flex-1" />
          <div className="skeleton-pulse rounded-lg min-h-[56px] flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('skeleton-pulse rounded-lg', className)}
      style={{ width, height }}
      role="status"
      aria-label="लोड होत आहे"
    />
  );
}

interface SkeletonDashboardProps {
  cardCount?: number;
}

export function SkeletonDashboard({ cardCount = 4 }: SkeletonDashboardProps) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: cardCount }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
