import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file — available in Node.js/proxy context only, NOT sent to browser
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // ── Hugging Face Inference API ──────────────────────────────────────
        // API key is injected HERE at the proxy (server-side).
        // The browser sends requests to /api/hf/* with NO auth header.
        // Vite proxy adds the real Authorization header before forwarding.
        // The key is NEVER embedded in the browser bundle.
        '/api/hf': {
          target: 'https://router.huggingface.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hf/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_HF_KEY}`)
            })
          },
        },
        // ── Nvidia Inference API ────────────────────────────────────────────
        // Key is injected HERE at the proxy (server-side).
        // Browser sends /api/nvidia/* with NO auth header.
        // Vite proxy adds Authorization before forwarding. Key never in bundle.
        '/api/nvidia': {
          target: 'https://integrate.api.nvidia.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_NVIDIA_KEY}`)
            })
          },
        },
      },
    },
  }
})
