import path from 'node:path';
import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
  // Read all migrations in the `migrations` directory
  const migrationsPath = path.join(__dirname, 'migrations');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      include: ['test/**/*.test.ts'], // Include test files for execution
      coverage: {
        provider: 'istanbul', // Use Istanbul for coverage
        reporter: ['text', 'html'], // Coverage reports in text and HTML format
        reportsDirectory: './coverage', // Directory for storing reports
        exclude: [
          '**/node_modules/**', // Always exclude node_modules
          '**/test/**', // Exclude test files from coverage calculation
          '**/*.d.ts', // Exclude type definitions
          '**/vitest.config.*', // Exclude configuration files
        ],
      },
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          isolatedStorage: true,
          singleWorker: false, // ref: https://developers.cloudflare.com/workers/testing/vitest-integration/isolation-and-concurrency/
          main: './src/index.ts', // ref: https://github.com/evanderkoogh/otel-cf-workers/issues/48
          wrangler: { configPath: './wrangler.toml' },
          miniflare: {
            // Add a test-only binding for migrations, so we can apply them in a
            // setup file
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
