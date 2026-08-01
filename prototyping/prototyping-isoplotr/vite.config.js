import { defineConfig } from 'vite'

/**
 * Proxy /api → PROD so the browser never hits CORS.
 *
 * Spring on AusGeochem returns 403 "Invalid CORS request" if the proxied
 * request still carries Origin: http://localhost:…. Strip Origin/Referer
 * on the way in (before http-proxy), not only on proxyReq.
 */
function stripBrowserOrigin() {
  return {
    name: 'strip-browser-origin-for-api-proxy',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/api')) {
          delete req.headers.origin
          delete req.headers.referer
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [stripBrowserOrigin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://app.ausgeochem.org',
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
          })
        },
      },
    },
  },
})
