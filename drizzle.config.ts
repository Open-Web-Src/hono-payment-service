import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  out: './migrations', // Path where generated files will be saved
  schema: './src/database/index.ts', // Point to the index file that re-exports all schemas
  verbose: true,
});
