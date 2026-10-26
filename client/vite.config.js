import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // prompt = user taps Update; new deploy pe app "Update required" dikhati hai
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'logo-icon.png',
        'logo-icon-transparent.png',
        'marblex-mark.png',
        'logo.png',
      ],
      manifest: {
        id: '/',
        name: 'MARBLEX Chemical & Rubber',
        short_name: 'MARBLEX',
        description:
          'Construction chemicals, waterproofing, waterstops and industrial rubber — shop and negotiate on WhatsApp.',
        theme_color: '#0a3d52',
        background_color: '#0a3d52',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['business', 'shopping'],
        prefer_related_applications: false,
        related_applications: [
          {
            platform: 'webapp',
            url: 'https://www.marblex.com/manifest.webmanifest',
          },
        ],
        icons: [
          {
            src: '/logo-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/marblex-mark.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Shop products',
            short_name: 'Shop',
            url: '/',
            description: 'Browse MARBLEX catalog',
          },
          {
            name: 'WhatsApp desk',
            short_name: 'WhatsApp',
            url: '/?focus=whatsapp',
            description: 'Open negotiation / quote',
          },
          {
            name: 'Cart',
            short_name: 'Cart',
            url: '/cart',
            description: 'Review cart & checkout',
          },
          {
            name: 'Contact',
            short_name: 'Contact',
            url: '/contact',
          },
        ],
        share_target: {
          action: '/share',
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
        },
      },
      workbox: {
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/admin/],
        // Keep install size sane — exclude heavy bot frame dumps / big videos
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        globIgnores: [
          '**/node_modules/**',
          '**/_bot_frames/**',
          '**/_bot_out/**',
          '**/*.mp4',
          '**/*.webm',
          '**/pdfs/**',
          // Large catalog media — runtime image cache handles these after first view
          '**/brochures/**',
          '**/products/**',
          '**/about/**',
          '**/hero/**',
          '**/images/**',
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'marblex-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 30 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'marblex-images',
              expiration: { maxEntries: 96, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'marblex-google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@mui/icons-material')) return 'mui-icons'
          if (id.includes('@mui')) return 'mui'
          if (id.includes('react-router')) return 'router'
          return 'vendor'
        },
      },
    },
  },
})
