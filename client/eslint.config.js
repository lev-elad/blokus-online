import js from '@eslint/js';
import globals from 'globals';

// Minimal lint pass for plain-JS config files. TypeScript/TSX sources are
// statically checked by `tsc --noEmit` (see `npm run typecheck`); a full
// typescript-eslint setup can be layered on later.
export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
];
