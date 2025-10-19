/**
 * Type declarations for Vitest with jest-dom matchers
 */

import '@testing-library/jest-dom';
import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

type CustomMatchers<R = unknown> = TestingLibraryMatchers<typeof expect.stringContaining, R>;

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
