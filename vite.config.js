import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdPlugin from 'vite-plugin-markdown'

const markdown = mdPlugin.default

export default defineConfig({
  publicDir: 'public', // ✅ 이 줄을 추가해줘
  plugins: [
    react(),
    markdown({ mode: ['html'] }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

