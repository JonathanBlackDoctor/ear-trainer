import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'node_modules', 'public']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // `react-hooks/purity` flags Date.now()/Math.random() inside event
      // handlers (not actually called during render). The codebase uses these
      // legitimately in timer-based game logic — disable rather than mask.
      'react-hooks/purity': 'off',
      // Tighten signal but don't block CI on pre-existing patterns. New code
      // should still aim to be clean; these become hard errors via review.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-empty-pattern': 'warn',
    },
  },
  // Tests get full Node globals + relaxed any.
  {
    files: ['**/*.test.ts', '**/__tests__/**'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
