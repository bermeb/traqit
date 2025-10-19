/**
 * RecentEntries Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentEntries } from '../RecentEntries';
import { Entry, Field } from '../../../types';

describe('RecentEntries Component', () => {
  const mockFields: Field[] = [
    {
      id: 'field-1',
      name: 'Gewicht',
      unit: 'kg',
      type: 'number',
      createdAt: new Date(),
      order: 0,
    },
    {
      id: 'field-2',
      name: 'KFA',
      unit: '%',
      type: 'number',
      createdAt: new Date(),
      order: 1,
    },
    {
      id: 'field-3',
      name: 'Bauch',
      unit: 'cm',
      type: 'number',
      createdAt: new Date(),
      order: 2,
    },
  ];

  describe('Empty State', () => {
    it('should show empty message when no entries', () => {
      render(<RecentEntries entries={[]} fields={mockFields} />);

      expect(screen.getByText('Noch keine Einträge vorhanden.')).toBeInTheDocument();
    });

    it('should render Card component for empty state', () => {
      const { container } = render(<RecentEntries entries={[]} fields={mockFields} />);

      const card = container.querySelector('.recent-entries--empty');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Displaying Entries', () => {
    it('should render single entry', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
            'field-2': '18',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('Gewicht')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.getByText('KFA')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('should render multiple entries', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
        {
          id: 'entry-2',
          date: new Date('2025-01-14'),
          values: {
            'field-1': '76.0',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      const weightLabels = screen.getAllByText('Gewicht');
      expect(weightLabels).toHaveLength(2);
      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.getByText('76.0')).toBeInTheDocument();
    });

    it('should display entry date', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('15.01.2025')).toBeInTheDocument();
    });

    it('should show date icon', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('📅')).toBeInTheDocument();
    });
  });

  describe('Field Values Display', () => {
    it('should display field names and values', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
            'field-2': '18',
            'field-3': '85',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('Gewicht')).toBeInTheDocument();
      expect(screen.getByText('KFA')).toBeInTheDocument();
      expect(screen.getByText('Bauch')).toBeInTheDocument();

      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should display field units', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
            'field-2': '18',
            'field-3': '85',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('kg')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
      expect(screen.getByText('cm')).toBeInTheDocument();
    });

    it('should skip fields that do not exist', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
            'non-existent-field': '100',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('Gewicht')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('should render entries with no matching fields', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'non-existent-1': '100',
            'non-existent-2': '200',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      const { container } = render(<RecentEntries entries={entries} fields={mockFields} />);

      const valuesContainer = container.querySelector('.recent-entry__values');
      expect(valuesContainer).toBeInTheDocument();
      expect(valuesContainer?.children).toHaveLength(0);
    });
  });

  describe('Image Badge', () => {
    it('should show image badge when entry has imageId', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          imageId: 'image-123',
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('📸 Mit Bild')).toBeInTheDocument();
    });

    it('should not show image badge when entry has no imageId', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.queryByText('📸 Mit Bild')).not.toBeInTheDocument();
    });
  });

  describe('Notes Display', () => {
    it('should display notes when present', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          notes: 'Feeling great today!',
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('Feeling great today!')).toBeInTheDocument();
      expect(screen.getByText('💬')).toBeInTheDocument();
    });

    it('should not display notes section when notes are empty', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      const { container } = render(<RecentEntries entries={entries} fields={mockFields} />);

      const notesSection = container.querySelector('.recent-entry__notes');
      expect(notesSection).not.toBeInTheDocument();
    });

    it('should display notes icon', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          notes: 'Test note',
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      const { container } = render(<RecentEntries entries={entries} fields={mockFields} />);

      const notesIcon = container.querySelector('.recent-entry__notes-icon');
      expect(notesIcon).toBeInTheDocument();
      expect(notesIcon?.textContent).toBe('💬');
    });
  });

  describe('Styling and Classes', () => {
    it('should apply correct CSS classes', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      const { container } = render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(container.querySelector('.recent-entries')).toBeInTheDocument();
      expect(container.querySelector('.recent-entry')).toBeInTheDocument();
      expect(container.querySelector('.recent-entry__header')).toBeInTheDocument();
      expect(container.querySelector('.recent-entry__date')).toBeInTheDocument();
      expect(container.querySelector('.recent-entry__values')).toBeInTheDocument();
    });

    it('should render Card components for entries', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      const { container } = render(<RecentEntries entries={entries} fields={mockFields} />);

      const cards = container.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle entry with all features', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
            'field-2': '18',
          },
          imageId: 'image-123',
          notes: 'Best day ever!',
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('15.01.2025')).toBeInTheDocument();
      expect(screen.getByText('Gewicht')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.getByText('KFA')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('📸 Mit Bild')).toBeInTheDocument();
      expect(screen.getByText('Best day ever!')).toBeInTheDocument();
    });

    it('should render 5 recent entries', () => {
      const entries: Entry[] = Array.from({ length: 5 }, (_, i) => ({
        id: `entry-${i}`,
        date: new Date(`2025-01-${15 - i}`),
        values: {
          'field-1': `${75 + i}`,
        },
        createdAt: new Date(),
      updatedAt: new Date(),
      
      }));

      const { container } = render(<RecentEntries entries={entries} fields={mockFields} />);

      const entryCards = container.querySelectorAll('.recent-entry');
      expect(entryCards).toHaveLength(5);
    });

    it('should handle entries with decimal values', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.567',
            'field-2': '18.234',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={mockFields} />);

      expect(screen.getByText('75.567')).toBeInTheDocument();
      expect(screen.getByText('18.234')).toBeInTheDocument();
    });

    it('should handle entries with missing fields array', () => {
      const entries: Entry[] = [
        {
          id: 'entry-1',
          date: new Date('2025-01-15'),
          values: {
            'field-1': '75.5',
          },
          createdAt: new Date(),
      updatedAt: new Date(),
      
        },
      ];

      render(<RecentEntries entries={entries} fields={[]} />);

      // Should not show any field names since no fields are provided
      expect(screen.queryByText('Gewicht')).not.toBeInTheDocument();
    });
  });
});
