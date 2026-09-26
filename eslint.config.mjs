import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.plugins('jsx-a11y'),
  ...compat.extends('plugin:jsx-a11y/recommended'),
  {
    rules: {
      // Disallow 'any' type — enforces type safety
      '@typescript-eslint/no-explicit-any': 'error',
      // Disallow unused variables
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Require consistent return types
      '@typescript-eslint/explicit-function-return-type': 'off',
      // No non-null assertions — use proper type guards
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Accessibility: all interactive elements must be keyboard accessible
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'],
  },
];

export default eslintConfig;
