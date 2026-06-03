import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ""),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""),
    },
    resolve: {
      alias: [
        { find: /^node-fetch$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^cross-fetch$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^cross-fetch\/.*$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: /^whatwg-fetch$/, replacement: path.resolve(__dirname, 'src/empty.js') },
        { find: '@', replacement: path.resolve(__dirname, '.') }
      ],
    },
    server: {
      hmr: {
        overlay: false
      },
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'chart-vendor': ['recharts'],
          }
        }
      }
    }
  }
})
