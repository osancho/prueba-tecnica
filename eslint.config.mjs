import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core/*/domain/**/*',
              from: ['./src/core/*/!(domain)/**/*', './src/!(core)/**/*'],
              message: 'The domain imports only from the domain.',
            },
            {
              target: './src/core/*/application/**/*',
              from: ['./src/core/*/infrastructure/**/*', './src/!(core)/**/*'],
              message:
                'Use cases import only from the domain and from other use cases.',
            },
            {
              // Not the tests, which need their runner.
              target: './src/core/*/{domain,application}/*',
              from: './node_modules/**/*',
              message: 'The domain and the use cases depend on no package.',
            },
            {
              target: './src/core/*/infrastructure/**/*',
              from: './src/!(core|services)/**/*',
              message: 'Adapters import only from the core and from services.',
            },
            {
              target: './src/services/**/*',
              from: './src/core/**/*',
              message: 'Services know nothing about the core.',
            },
            {
              target: './src/!(app|core)/**/*',
              from: './src/core/*/infrastructure/**/*',
              message:
                'Only the composition roots in src/app name an adapter; everything else receives it.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
