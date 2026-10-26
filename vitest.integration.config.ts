import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// Интеграционные тесты против реального проекта Supabase.
// Требуют VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY в .env и двух учёток
// (по умолчанию — демо из README; переопределяются TEST_*_EMAIL / TEST_*_PASSWORD).
export default defineConfig(({ mode }) => ({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    env: loadEnv(mode, process.cwd(), ''),
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
}))
