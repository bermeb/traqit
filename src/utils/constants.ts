/**
 * App Constants
 */

export const APP_NAME = 'TraqIt';
export const APP_VERSION = '1.0.0';
export const DATA_FORMAT_VERSION = '1.0';

// Image constraints
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_WIDTH = 1920;
export const MAX_IMAGE_HEIGHT = 1920;
export const IMAGE_QUALITY = 0.85;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Date formats
export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATETIME_FORMAT = 'dd.MM.yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Chart colors (for multiple fields)
export const CHART_COLORS = [
  '#4A90E2', // Blue
  '#E24A4A', // Red
  '#4AE290', // Green
  '#E2904A', // Orange
  '#904AE2', // Purple
  '#E2E24A', // Yellow
  '#4AE2E2', // Cyan
  '#E24A90', // Pink
];

// Routes
export const ROUTES = {
  HOME: '/',
  FIELDS: '/fields',
  ENTRIES: '/entries',
  CHARTS: '/charts',
  BACKUP: '/backup',
  VIEW_CONFIGS: '/view-configs',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'traqit-theme',
  LAST_BACKUP: 'traqit-last-backup',
  CHART_PREFERENCES: 'traqit-chart-prefs',
  INITIAL_FIELDS_CREATED: 'traqit-initial-fields-created',
  VIEW_CONFIGS_CREATED: 'traqit-view-configs-created',
  GOAL_DIRECTION_MIGRATED: 'traqit-goal-direction-migrated',
} as const;

// Default fields that are created on first app start
export const DEFAULT_FIELDS = [
  { name: 'KFA', unit: '%' },
  { name: 'Knochenmasse', unit: '%' },
  { name: 'Muskelmasse', unit: '%' },
  { name: 'Wasseranteil', unit: '%' },
  { name: 'Gewicht', unit: 'kg' },
  { name: 'Bauch', unit: 'cm' },
  { name: 'Taille', unit: 'cm' },
  { name: 'Nacken', unit: 'cm' },
  { name: 'Brustumfang', unit: 'cm' },
  { name: 'Bizepsumfang', unit: 'cm' },
] as const;
