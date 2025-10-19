/**
 * Skeleton Component
 * Loading placeholder with shimmer effect
 */

import './Skeleton.css';

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Variant of the skeleton */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Number of lines (for text variant) */
  count?: number;
  /** Custom className */
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'text',
  count = 1,
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (count > 1 && variant === 'text') {
    return (
      <div className="skeleton-group">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`skeleton skeleton--${variant} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
    />
  );
}

/** Pre-configured skeleton for card loading */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <Skeleton width="60%" height={24} variant="rounded" />
        <Skeleton width={40} height={40} variant="circular" />
      </div>
      <div className="skeleton-card__body">
        <Skeleton width="100%" height={80} variant="rounded" />
        <Skeleton count={3} width="100%" height={16} />
      </div>
    </div>
  );
}

/** Pre-configured skeleton for list item loading */
export function SkeletonListItem() {
  return (
    <div className="skeleton-list-item">
      <Skeleton width={60} height={60} variant="rounded" />
      <div className="skeleton-list-item__content">
        <Skeleton width="40%" height={20} variant="rounded" />
        <Skeleton width="80%" height={16} />
        <Skeleton width="60%" height={14} />
      </div>
    </div>
  );
}
