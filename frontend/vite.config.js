import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: 3000,
            proxy: {
                '/api': {
                    // Sử dụng env.VITE_API_PROXY_TARGET thay cho import.meta.env
                    target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
                    changeOrigin: true,
                }
            }
        }
    }
})