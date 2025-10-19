/**
 * Skeleton Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonListItem } from '../Skeleton';

describe('Skeleton Component', () => {
  it('should render skeleton with default variant', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.skeleton--text');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render with circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('.skeleton--circular');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render with rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const skeleton = container.querySelector('.skeleton--rectangular');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render with rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />);
    const skeleton = container.querySelector('.skeleton--rounded');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom width', () => {
    const { container } = render(<Skeleton width="200px" />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('should apply custom height', () => {
    const { container } = render(<Skeleton height="50px" />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('should render multiple skeletons with count', () => {
    const { container } = render(<Skeleton count={3} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeleton = container.querySelector('.custom-skeleton');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('SkeletonCard Component', () => {
  it('should render skeleton card', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.querySelector('.skeleton-card');
    expect(card).toBeInTheDocument();
  });

  it('should contain header and body', () => {
    const { container } = render(<SkeletonCard />);
    const header = container.querySelector('.skeleton-card__header');
    const body = container.querySelector('.skeleton-card__body');

    expect(header).toBeInTheDocument();
    expect(body).toBeInTheDocument();
  });
});

describe('SkeletonListItem Component', () => {
  it('should render skeleton list item', () => {
    const { container } = render(<SkeletonListItem />);
    const listItem = container.querySelector('.skeleton-list-item');
    expect(listItem).toBeInTheDocument();
  });

  it('should contain content section', () => {
    const { container } = render(<SkeletonListItem />);
    const content = container.querySelector('.skeleton-list-item__content');
    expect(content).toBeInTheDocument();
  });
});
