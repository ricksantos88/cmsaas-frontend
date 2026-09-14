import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // O backend só libera as origens de cmsaas.cors.allowed-origins. O proxy evita
    // depender dessa configuração em dev: o navegador só fala com o próprio Vite.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (
              id.includes('@radix-ui') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'vendor-ui'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('axios')) {
              return 'vendor-http'
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts', 'src/main.tsx'],
      thresholds: {
        // Onde mora a lógica, a régua é alta — é o que quebra o build ao regredir.
        'src/shared/api/**': { lines: 85, functions: 70, branches: 80, statements: 85 },
        'src/shared/lib/**': { lines: 85, functions: 70, branches: 80, statements: 85 },
        'src/features/auth/permissions.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
        // Piso global: as telas ainda estão sendo cobertas módulo a módulo
        // (docs/specs/tasks.md → Fase 8). Sobe junto com cada módulo testado.
        lines: 25,
        functions: 50,
        branches: 70,
        statements: 25,
      },
    },
  },
})
