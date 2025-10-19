/**
 * Card Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from '../Card';

describe('Card Component', () => {
  it('should render card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply default padding', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--padding-md');
  });

  it('should apply custom padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--padding-sm');
  });

  it('should apply no padding', () => {
    const { container } = render(<Card padding="none">Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--padding-none');
  });

  it('should apply hoverable class', () => {
    const { container } = render(<Card hoverable>Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--hoverable');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('custom-card');
  });
});

describe('CardHeader Component', () => {
  it('should render header content', () => {
    render(<CardHeader>Header</CardHeader>);
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('card__header');
  });
});

describe('CardBody Component', () => {
  it('should render body content', () => {
    render(<CardBody>Body</CardBody>);
    const body = screen.getByText('Body');
    expect(body).toBeInTheDocument();
    expect(body).toHaveClass('card__body');
  });
});

describe('CardFooter Component', () => {
  it('should render footer content', () => {
    render(<CardFooter>Footer</CardFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('card__footer');
  });
});

describe('Card Composition', () => {
  it('should render complete card with header, body, and footer', () => {
    render(
      <Card>
        <CardHeader>Card Title</CardHeader>
        <CardBody>Card Body Content</CardBody>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Body Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});
