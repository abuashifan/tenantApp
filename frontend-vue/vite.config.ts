import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
    ],
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.eslintcache',
          '**/.oxlintcache',
          '**/.vite/**',
          '**/.vite-temp/**',
          '**/dist/**',
          '**/coverage/**',
          '**/.git/**',
          '**/.idea/**',
          '**/.vscode/**',
          '**/*.tsbuildinfo',
        ],
      },
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
