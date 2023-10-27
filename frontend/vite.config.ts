import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import path from 'node:path';

const manifest: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: ['favicon.ico'],
  manifest: {
    name: 'ChatApp Redux',
    short_name: 'ChatApp',
    description: 'Chat App Frontend made with React + Redux',
    background_color: '#eeaeca',
    theme_color: '#eeaeca',
    display_override: ['window-controls-overlay'],
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png'
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
};

export default defineConfig({
  plugins: [react(), VitePWA(manifest)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@views': path.resolve(__dirname, './src/views'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@slices': path.resolve(__dirname, './src/store/slices'),
      '@components': path.resolve(__dirname, './src/shared/components')
    }
  },
  define: {
    'process.env': {}
  }
});
