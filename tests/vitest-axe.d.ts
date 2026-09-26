/// <reference types="vitest" />

// Augment Vitest's assertion interface with vitest-axe matchers
import type { AxeMatchers } from 'vitest-axe/extend-expect';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
