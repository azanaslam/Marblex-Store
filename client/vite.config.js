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
      // prompt = user taps Update; installed app shows "Update required"
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'logo.png',
        'logo-icon.png',
        'logo-icon-transparent.png',
        'marblex-mark.png',
        'pwa-icon-192.png',
        'pwa-icon-512.png',
        'pwa-icon-1024.png',
        'pwa-maskable-192.png',
        'pwa-maskable-512.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'MARBLEX Chemical & Rubber',
        short_name: 'MARBLEX',
        description:
          'Construction chemicals, waterproofing, waterstops and industrial rubber — shop and negotiate on WhatsApp.',
        theme_color: '#0a3d52',
        // Match BrandSplash so OS splash ≠ white box on teal
        background_color: '#f5f7fa',
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
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
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
        // Phone push + notificationclick (file lives in public/)
        importScripts: ['push-handler.js'],
        navigateFallback: '/index.html',
        // Never SPA-fallback the client portal HTML (or assets) into the iframe —
        // that nested the whole store UI and caused a "double screen" in the installed app.
        navigateFallbackDenylist: [
          /^\/api/,
          /\/marblex-client-portal\.html/i,
          /\.[a-z0-9]+$/i,
        ],
        // Cache-bust ?v= on portal must still hit the precached HTML
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/],
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
