import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

/** Vitest extends the same Vite plugins and aliases as `vite.config.ts`. */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      watch: false,
      setupFiles: ['./src/tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/lib/pomodoro.ts', 'src/stores/timerStore.ts'],
        exclude: [
          'node_modules/',
          'dist/',
          'src/tests/',
          '**/*.d.ts',
          '**/*.config.*',
          'src/routeTree.gen.ts',
          'src/main.tsx',
        ],
        thresholds: {
          lines: 60,
          functions: 60,
          branches: 50,
          statements: 60,
        },
      },
    },
  }),
)
