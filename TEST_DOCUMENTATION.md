# Test Documentation

## Overview

TraqIt uses [Vitest](https://vitest.dev/) as the testing framework with [React Testing Library](https://testing-library.com/react) for component testing. All tests are written in TypeScript and follow best practices for modern React testing.

## Test Structure

```
src/
├── utils/__tests__/           # Utility function tests
│   ├── date.test.ts          # Date utilities
│   ├── statistics.test.ts    # Statistics calculations
│   ├── validation.test.ts    # Validation functions
│   └── chartPresets.test.ts  # Chart preset utilities
├── components/
│   └── common/__tests__/      # Common component tests
│       ├── Button.test.tsx    # Button component
│       ├── Card.test.tsx      # Card component
│       ├── Modal.test.tsx     # Modal component
│       └── Skeleton.test.tsx  # Skeleton loader
└── test/
    ├── setup.ts              # Global test setup
    └── integration/          # Integration tests
        ├── defaultFields.test.ts    # Default fields initialization
        └── chartPresets.test.ts     # Chart presets integration
```

## Running Tests

### Basic Commands

```bash
# Run all tests (watch mode)
npm test

# Run all tests once
npm test -- --run

# Run tests with UI interface
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Filtering Tests

```bash
# Run specific test file
npm test -- src/utils/__tests__/date.test.ts

# Run tests matching pattern
npm test -- --grep "Button"

# Run only changed tests
npm test -- --changed
```

## Test Categories

### 1. Utility Tests

Tests for utility functions that handle data transformation, validation, and calculations.

#### Date Utilities (`src/utils/__tests__/date.test.ts`)

Tests for date formatting and manipulation:
- `formatDate()` - Format dates in German locale (DD.MM.YYYY)
- `formatDateTime()` - Format dates with time
- `dateToInputValue()` - Convert Date to input format (YYYY-MM-DD)
- `parseDate()` - Parse ISO date strings
- `inputValueToDate()` - Convert input value to Date
- `isSameDay()` - Compare if two dates are the same day
- `getStartOfDay()` / `getEndOfDay()` - Get day boundaries
- `getDateRangePresets()` - Get preset date ranges

**Example:**
```typescript
it('should format date correctly', () => {
  const date = new Date('2025-10-18T12:00:00');
  const formatted = formatDate(date);
  expect(formatted).toBe('18.10.2025');
});
```

#### Statistics Utilities (`src/utils/__tests__/statistics.test.ts`)

Tests for statistics calculations on entry data:
- `calculateFieldStatistics()` - Calculate min, max, average, trends
- `calculateAllStatistics()` - Calculate stats for all fields
- `calculateStreak()` - Calculate entry streaks
- `formatStatValue()` - Format values with units
- `formatChangeValue()` - Format changes with signs

**Example:**
```typescript
it('should calculate correct statistics', () => {
  const stats = calculateFieldStatistics(mockEntries, mockField);
  expect(stats.current).toBe(73.5);
  expect(stats.min).toBe(73.5);
  expect(stats.max).toBe(75);
  expect(stats.average).toBeCloseTo(74.17, 2);
});
```

#### Validation Utilities (`src/utils/__tests__/validation.test.ts`)

Tests for input validation:
- `validateFieldName()` - Validate field name (1-50 chars)
- `validateFieldUnit()` - Validate unit (1-20 chars)
- `validateNumericValue()` - Validate numeric input
- `validateTextValue()` - Validate text input (1-500 chars)
- `validateImageFile()` - Validate image type and size
- `validateNotes()` - Validate notes (0-1000 chars)
- `validateExportVersion()` - Validate export format version
- `sanitizeString()` - Remove dangerous characters

**Example:**
```typescript
it('should accept valid field names', () => {
  expect(validateFieldName('Gewicht').valid).toBe(true);
  expect(validateFieldName('Body Fat %').valid).toBe(true);
});

it('should reject empty names', () => {
  const result = validateFieldName('');
  expect(result.valid).toBe(false);
  expect(result.error).toBeTruthy();
});
```

### 2. Component Tests

Tests for React components using React Testing Library.

#### Button Component (`src/components/common/__tests__/Button.test.tsx`)

Tests button variants, sizes, states, and interactions:
- Rendering with different variants (primary, secondary, danger, ghost)
- Different sizes (sm, md, lg)
- Disabled state
- Loading state
- Click handling

**Example:**
```typescript
it('should call onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>Click me</Button>);

  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### Card Component (`src/components/common/__tests__/Card.test.tsx`)

Tests card container and sub-components:
- Rendering with children
- Padding variants (none, sm, md, lg)
- Hoverable state
- Custom className
- CardHeader, CardBody, CardFooter sub-components

**Example:**
```typescript
it('should apply custom padding', () => {
  const { container } = render(<Card padding="sm">Content</Card>);
  const card = container.querySelector('.card');
  expect(card).toHaveClass('card--padding-sm');
});
```

#### Modal Component (`src/components/common/__tests__/Modal.test.tsx`)

Tests modal dialog functionality:
- Opening and closing
- Backdrop click handling
- Close button
- Size variants
- Portal rendering

**Note:** Modal uses `createPortal` to render to `document.body`, so tests query from `document.body` instead of the render container.

**Example:**
```typescript
it('should call onClose when backdrop is clicked', async () => {
  const handleClose = vi.fn();
  render(<Modal isOpen={true} onClose={handleClose} title="Test">Content</Modal>);

  // Modal is rendered via portal to document.body
  const backdrop = document.body.querySelector('.modal-backdrop');
  await user.click(backdrop);

  expect(handleClose).toHaveBeenCalledTimes(1);
});
```

#### Skeleton Component (`src/components/common/__tests__/Skeleton.test.tsx`)

Tests loading placeholder components:
- Different variants (text, circular, rectangular, rounded)
- Custom width and height
- Multiple skeletons with count prop
- Pre-configured SkeletonCard and SkeletonListItem

### 3. Integration Tests

Tests that verify multiple components working together.

#### Default Fields Integration (`src/test/integration/defaultFields.test.ts`)

Tests the initialization of default body measurement fields:
- Creating 10 default fields on first run
- Skipping if already initialized
- Skipping if fields already exist
- Verifying field properties

**Example:**
```typescript
it('should create default fields on first run', async () => {
  const result = await initializeDefaultFields();

  expect(result).toBe(true);
  expect(addField).toHaveBeenCalledTimes(DEFAULT_FIELDS.length);
  expect(localStorage.getItem('traqit-initial-fields-created')).toBe('true');
});
```

#### Chart Presets Integration (`src/test/integration/chartPresets.test.ts`)

Tests chart preset system integration with default fields:
- Preset existence and configuration
- Field matching with default fields
- Preset validation (types, ranges, descriptions)
- Field matching logic

## Test Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Test Setup (`src/test/setup.ts`)

Global test setup includes:

1. **Testing Library Matchers**: Extends expect with DOM-specific matchers
2. **IndexedDB Mock**: Mocks IDB for database operations
3. **localStorage Mock**: Provides localStorage implementation
4. **crypto.randomUUID Mock**: Generates test UUIDs
5. **matchMedia Mock**: Mocks window.matchMedia for responsive tests

## Mocking Strategy

### Database Operations

All IndexedDB operations are mocked using vi.mock():

```typescript
vi.mock('../../services/db', () => ({
  addField: vi.fn().mockResolvedValue(undefined),
  getFields: vi.fn().mockResolvedValue([]),
  // ... other DB functions
}));
```

### Browser APIs

Browser APIs that aren't available in jsdom are mocked in setup.ts:

```typescript
// localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// crypto.randomUUID
global.crypto = {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random()),
};
```

### Component Testing

For component tests, use React Testing Library utilities:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Render component
const { container } = render(<Component />);

// Query elements
const button = screen.getByRole('button');
const text = screen.getByText('Hello');

// User interactions
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
```

## Best Practices

### 1. Test File Naming

- Unit tests: `[filename].test.ts` or `[filename].test.tsx`
- Component tests: In `__tests__/` directory
- Integration tests: In `src/test/integration/`

### 2. Test Structure

Use descriptive `describe` and `it` blocks:

```typescript
describe('Component/Function Name', () => {
  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should calculate statistics', () => {
  // Arrange: Set up test data
  const mockData = [/* ... */];

  // Act: Execute the function
  const result = calculateStatistics(mockData);

  // Assert: Verify the result
  expect(result).toBeDefined();
  expect(result.average).toBe(10);
});
```

### 4. Mock Data

Create reusable mock data objects:

```typescript
const mockField: Field = {
  id: 'field-1',
  name: 'Gewicht',
  unit: 'kg',
  type: 'number',
  createdAt: new Date('2025-01-01'),
  order: 0,
};
```

### 5. Async Testing

Use `async`/`await` for asynchronous operations:

```typescript
it('should handle async operations', async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.click(screen.getByRole('button'));
  await screen.findByText('Success');

  expect(mockFunction).toHaveBeenCalled();
});
```

### 6. Component Testing

- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility
- Avoid querying by class names when possible

### 7. Cleanup

React Testing Library automatically cleans up after each test. For manual cleanup:

```typescript
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});
```

## Coverage Goals

- **Utilities**: 90%+ coverage
- **Components**: 80%+ coverage
- **Integration**: Key user flows covered

Current coverage:
- **Test Files**: 10 files
- **Tests**: 123 tests passing
- **Utilities**: Comprehensive coverage of date, statistics, validation
- **Components**: Core UI components (Button, Card, Modal, Skeleton)
- **Integration**: Default fields and chart presets

## Continuous Integration

For CI/CD pipelines, use:

```bash
npm test -- --run --reporter=junit --outputFile=test-results.xml
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **"not wrapped in act(...)" warning**
   - Use `await` for user interactions
   - Use `waitFor` for async updates

2. **Portal elements not found**
   - Query from `document.body` for portaled components
   - Example: Modals, Tooltips

3. **Mock not working**
   - Ensure mocks are defined before imports
   - Clear mocks in `beforeEach` or `afterEach`

4. **Async timeout**
   - Increase timeout in test or config
   - Use `waitFor` with custom timeout

### Debugging Tests

```bash
# Run single test in debug mode
npm test -- --run --reporter=verbose [test-file]

# Use console.log for debugging
console.log(screen.debug()); // Prints DOM structure
```

## Writing New Tests

### 1. Utility Functions

```typescript
import { describe, it, expect } from 'vitest';
import { myUtility } from '../myUtility';

describe('MyUtility', () => {
  it('should handle valid input', () => {
    expect(myUtility('valid')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myUtility('')).toBe('default');
    expect(myUtility(null)).toBe('default');
  });
});
```

### 2. React Components

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Integration Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { initializeApp } from '../app';

describe('Feature Integration', () => {
  beforeEach(() => {
    // Reset state
  });

  it('should complete full user flow', async () => {
    // Test multiple components working together
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event](https://testing-library.com/docs/user-event/intro)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

- ✅ 123 tests passing
- ✅ 10 test files
- ✅ Comprehensive utility coverage
- ✅ Core component coverage
- ✅ Integration test coverage
- ✅ Automated test scripts
- ✅ Coverage reporting configured

The test suite provides a solid foundation for maintaining code quality and catching regressions early in the development process.
