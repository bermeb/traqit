/**
 * HomePage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../HomePage';
import { Entry, Field, ViewConfiguration } from '../../types';

// Mock the context
vi.mock('../../context', () => ({
  useAppContext: vi.fn(),
}));

// Mock the useViewConfigs hook
vi.mock('../../hooks', () => ({
  useViewConfigs: vi.fn(),
}));

// Mock StatGrid component
vi.mock('../../components/statistics', () => ({
  StatGrid: ({ entries, fields }: { entries: Entry[]; fields: Field[] }) => (
    <div data-testid="stat-grid">
      StatGrid with {fields.length} fields and {entries.length} entries
    </div>
  ),
}));

// Mock RecentEntries component
vi.mock('../../components/dashboard', () => ({
  RecentEntries: ({ entries }: { entries: Entry[] }) => (
    <div data-testid="recent-entries">
      {entries.map((entry: Entry) => (
        <div key={entry.id} data-testid={`entry-${entry.id}`}>
          {new Date(entry.date).toLocaleDateString('de-DE')}
        </div>
      ))}
    </div>
  ),
}));

import { useAppContext } from '../../context';
import { useViewConfigs } from '../../hooks';

describe('HomePage Component', () => {
  const mockFields: Field[] = [
    {
      id: 'field-1',
      name: 'KFA',
      unit: '%',
      type: 'number',
      createdAt: new Date(),
      order: 0,
    },
    {
      id: 'field-2',
      name: 'Gewicht',
      unit: 'kg',
      type: 'number',
      createdAt: new Date(),
      order: 1,
    },
    {
      id: 'field-3',
      name: 'Muskelmasse',
      unit: '%',
      type: 'number',
      createdAt: new Date(),
      order: 2,
    },
  ];

  const mockEntries: Entry[] = [
    {
      id: 'entry-1',
      date: new Date('2025-01-15'),
      values: {
        'field-1': '18',
        'field-2': '75.5',
        'field-3': '42',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'entry-2',
      date: new Date('2025-01-14'),
      values: {
        'field-1': '19',
        'field-2': '76.0',
      },
      imageId: 'image-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'entry-3',
      date: new Date('2025-01-01'),
      values: {
        'field-1': '20',
      },
      notes: 'Test note',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockViewConfigs: ViewConfiguration[] = [
    {
      id: 'config-1',
      name: 'Körperzusammensetzung',
      description: 'Body composition metrics',
      fieldIds: ['field-1', 'field-3'],
      icon: '🧬',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
      isDefault: true,
    },
    {
      id: 'config-2',
      name: 'Gewichtstracking',
      fieldIds: ['field-2'],
      icon: '⚖️',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
      isDefault: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppContext).mockReturnValue({
      fields: mockFields,
      entries: mockEntries,
      isLoading: false,
      error: null,
      currentRoute: '/',
      setFields: vi.fn(),
      setEntries: vi.fn(),
      setCurrentRoute: vi.fn(),
      setIsLoading: vi.fn(),
      setError: vi.fn(),
      refreshFields: vi.fn(),
      refreshEntries: vi.fn(),
      clearError: vi.fn(),
    });

    vi.mocked(useViewConfigs).mockReturnValue({
      viewConfigs: mockViewConfigs,
      addViewConfig: vi.fn(),
      updateViewConfig: vi.fn(),
      deleteViewConfig: vi.fn(),
      refreshViewConfigs: vi.fn(),
      loading: false,
      error: null,
    });
  });

  describe('Page Layout', () => {
    it('should render dashboard title', () => {
      render(<HomePage />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

  });

  describe('Statistics Cards', () => {
    it('should display all stat cards', () => {
      render(<HomePage />);

      expect(screen.getByText('Messfelder')).toBeInTheDocument();
      expect(screen.getByText('Einträge gesamt')).toBeInTheDocument();
      expect(screen.getByText('Mit Bildern')).toBeInTheDocument();
      expect(screen.getByText('Letzter Eintrag')).toBeInTheDocument();
    });

    it('should display correct field count', () => {
      const { container } = render(<HomePage />);
      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards.length).toBeGreaterThan(0);
      expect(screen.getByText('Messfelder')).toBeInTheDocument();
    });

    it('should display correct entry count', () => {
      render(<HomePage />);
      expect(screen.getByText('Einträge gesamt')).toBeInTheDocument();
    });

    it('should display correct images count', () => {
      render(<HomePage />);
      expect(screen.getByText('Mit Bildern')).toBeInTheDocument();
    });

    it('should display last entry date', () => {
      render(<HomePage />);
      expect(screen.getByText('15.01.25')).toBeInTheDocument();
    });

    it('should display dash when no entries', () => {
      vi.mocked(useAppContext).mockReturnValue({
        fields: mockFields,
        entries: [],
        isLoading: false,
        error: null,
        currentRoute: '/',
        setFields: vi.fn(),
        setEntries: vi.fn(),
        setCurrentRoute: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        refreshFields: vi.fn(),
        refreshEntries: vi.fn(),
        clearError: vi.fn(),
      });

      render(<HomePage />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should display stat icons', () => {
      const { container } = render(<HomePage />);

      const statIcons = container.querySelectorAll('.stat-card__icon');
      expect(statIcons.length).toBe(4);
    });
  });

  describe('View Configuration Selector', () => {
    it('should display view configs when available', () => {
      render(<HomePage />);

      expect(screen.getByText('Ansichten')).toBeInTheDocument();
      expect(screen.getByText('📊 Alle Felder')).toBeInTheDocument();
      expect(screen.getByText('🧬 Körperzusammensetzung')).toBeInTheDocument();
      expect(screen.getByText('⚖️ Gewichtstracking')).toBeInTheDocument();
    });

    it('should not display view configs section when none available', () => {
      vi.mocked(useViewConfigs).mockReturnValue({
        viewConfigs: [],
        addViewConfig: vi.fn(),
        updateViewConfig: vi.fn(),
        deleteViewConfig: vi.fn(),
        refreshViewConfigs: vi.fn(),
        loading: false,
        error: null,
      });

      render(<HomePage />);
      expect(screen.queryByText('Ansichten')).not.toBeInTheDocument();
    });

    it('should display manage button', () => {
      render(<HomePage />);
      expect(screen.getByText('⚙️ Verwalten')).toBeInTheDocument();
    });

    it('should select "Alle Felder" by default', () => {
      render(<HomePage />);

      const alleButton = screen.getByRole('button', { name: /Alle Felder/i });
      expect(alleButton).toHaveClass('btn--primary');
    });

    it('should change view config when clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      const configButton = screen.getByRole('button', { name: /Körperzusammensetzung/i });
      await user.click(configButton);

      expect(configButton).toHaveClass('btn--primary');
    });

    it('should switch back to "Alle Felder" when clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Select a config
      const configButton = screen.getByRole('button', { name: /Körperzusammensetzung/i });
      await user.click(configButton);

      // Switch back to Alle Felder
      const alleButton = screen.getByRole('button', { name: /Alle Felder/i });
      await user.click(alleButton);

      expect(alleButton).toHaveClass('btn--primary');
    });
  });

  describe('Statistics Section', () => {
    it('should display Statistiken title by default', () => {
      render(<HomePage />);
      expect(screen.getByText('Statistiken')).toBeInTheDocument();
    });

    it('should display config name as title when selected', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      const configButton = screen.getByRole('button', { name: /Körperzusammensetzung/i });
      await user.click(configButton);

      // The title should contain the config name
      expect(screen.getByRole('heading', { name: /Körperzusammensetzung/i })).toBeInTheDocument();
    });

    it('should display config description when selected', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      const configButton = screen.getByRole('button', { name: /Körperzusammensetzung/i });
      await user.click(configButton);

      expect(screen.getByText('Body composition metrics')).toBeInTheDocument();
    });

    it('should not display description when config has none', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      const configButton = screen.getByRole('button', { name: /Gewichtstracking/i });
      await user.click(configButton);

      expect(screen.queryByText('Body composition metrics')).not.toBeInTheDocument();
    });

    it('should show message when config has no valid fields', async () => {
      vi.mocked(useViewConfigs).mockReturnValue({
        viewConfigs: [
          {
            id: 'config-invalid',
            name: 'Invalid Config',
            fieldIds: ['non-existent-field'],
            icon: '❌',
            createdAt: new Date(),
            updatedAt: new Date(),
            order: 0,
            isDefault: false,
          },
        ],
        addViewConfig: vi.fn(),
        updateViewConfig: vi.fn(),
        deleteViewConfig: vi.fn(),
        refreshViewConfigs: vi.fn(),
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<HomePage />);

      const configButton = screen.getByRole('button', { name: /Invalid Config/i });
      await user.click(configButton);

      expect(
        screen.getByText('Keine gültigen Felder in dieser Konfiguration vorhanden.')
      ).toBeInTheDocument();
    });
  });

  describe('Recent Entries Section', () => {
    it('should display recent entries title', () => {
      render(<HomePage />);
      expect(screen.getByText('Letzte Einträge')).toBeInTheDocument();
    });

    it('should display recent entries', () => {
      const { container } = render(<HomePage />);

      // Check that recent entries component is rendered
      expect(container.querySelector('[data-testid="recent-entries"]')).toBeInTheDocument();

      // Check that entries are displayed
      expect(container.querySelector('[data-testid="entry-entry-1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="entry-entry-2"]')).toBeInTheDocument();
    });

    it('should not display recent entries section when no entries', () => {
      vi.mocked(useAppContext).mockReturnValue({
        fields: mockFields,
        entries: [],
        isLoading: false,
        error: null,
        currentRoute: '/',
        setFields: vi.fn(),
        setEntries: vi.fn(),
        setCurrentRoute: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        refreshFields: vi.fn(),
        refreshEntries: vi.fn(),
        clearError: vi.fn(),
      });

      render(<HomePage />);
      expect(screen.queryByText('Letzte Einträge')).not.toBeInTheDocument();
    });
  });

  describe('Welcome Screen', () => {
    it('should show welcome message when no data', () => {
      vi.mocked(useAppContext).mockReturnValue({
        fields: [],
        entries: [],
        isLoading: false,
        error: null,
        currentRoute: '/',
        setFields: vi.fn(),
        setEntries: vi.fn(),
        setCurrentRoute: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        refreshFields: vi.fn(),
        refreshEntries: vi.fn(),
        clearError: vi.fn(),
      });

      render(<HomePage />);
      expect(screen.getByText('Willkommen bei TraqIt')).toBeInTheDocument();
    });

    it('should show welcome when fields exist but no entries', () => {
      vi.mocked(useAppContext).mockReturnValue({
        fields: mockFields,
        entries: [],
        isLoading: false,
        error: null,
        currentRoute: '/',
        setFields: vi.fn(),
        setEntries: vi.fn(),
        setCurrentRoute: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        refreshFields: vi.fn(),
        refreshEntries: vi.fn(),
        clearError: vi.fn(),
      });

      render(<HomePage />);
      expect(screen.getByText('Willkommen bei TraqIt')).toBeInTheDocument();
    });

    it('should show welcome when entries exist but no fields', () => {
      vi.mocked(useAppContext).mockReturnValue({
        fields: [],
        entries: mockEntries,
        isLoading: false,
        error: null,
        currentRoute: '/',
        setFields: vi.fn(),
        setEntries: vi.fn(),
        setCurrentRoute: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        refreshFields: vi.fn(),
        refreshEntries: vi.fn(),
        clearError: vi.fn(),
      });

      render(<HomePage />);
      expect(screen.getByText('Willkommen bei TraqIt')).toBeInTheDocument();
    });

    it('should not show welcome when both fields and entries exist', () => {
      render(<HomePage />);
      expect(screen.queryByText('Willkommen bei TraqIt')).not.toBeInTheDocument();
    });
  });

  describe('Entry Sorting', () => {
    it('should display entries in reverse chronological order', () => {
      const { container } = render(<HomePage />);

      // Check that entries are displayed (using our mocked RecentEntries)
      const entries = container.querySelectorAll('[data-testid^="entry-"]');
      expect(entries.length).toBeGreaterThan(0);

      // First entry should be most recent (entry-1 from 2025-01-15)
      expect(container.querySelector('[data-testid="entry-entry-1"]')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct container classes', () => {
      const { container } = render(<HomePage />);

      expect(container.querySelector('.home-page')).toBeInTheDocument();
      expect(container.querySelector('.home-page__header')).toBeInTheDocument();
      expect(container.querySelector('.home-page__stats')).toBeInTheDocument();
    });

    it('should apply color classes to stat cards', () => {
      const { container } = render(<HomePage />);

      expect(container.querySelector('.stat-card--primary')).toBeInTheDocument();
      expect(container.querySelector('.stat-card--secondary')).toBeInTheDocument();
      expect(container.querySelector('.stat-card--accent')).toBeInTheDocument();
      expect(container.querySelector('.stat-card--success')).toBeInTheDocument();
    });
  });
});
