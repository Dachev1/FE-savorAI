import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const isDevOrTest = !isProd

  return {
    plugins: [
      react(),
      splitVendorChunkPlugin()
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      target: 'esnext',
      minify: isProd ? 'terser' : false,
      sourcemap: isDevOrTest,
      assetsInlineLimit: 4096,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
          chunkFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
          assetFileNames: isProd ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]',
          manualChunks: (id) => {
            // React and related core packages
            if (id.indexOf('node_modules/react') !== -1 || 
                id.indexOf('node_modules/react-dom') !== -1 || 
                id.indexOf('node_modules/scheduler') !== -1) {
              return 'react-core'
            }
            
            // React router and related navigation
            if (id.indexOf('node_modules/react-router') !== -1 || 
                id.indexOf('node_modules/history') !== -1 || 
                id.indexOf('node_modules/@remix-run') !== -1) {
              return 'react-routing'
            }
            
            // UI components and icons
            if (id.indexOf('node_modules/react-icons') !== -1 || 
                id.indexOf('node_modules/framer-motion') !== -1 || 
                id.indexOf('node_modules/tailwind') !== -1 || 
                id.indexOf('node_modules/aos') !== -1) {
              return 'ui-components'
            }
            
            // Date and utility libraries
            if (id.indexOf('node_modules/date-fns') !== -1 || 
                id.indexOf('node_modules/uuid') !== -1) {
              return 'utils'
            }
            
            // Form handling libraries
            if (id.indexOf('node_modules/formik') !== -1 || 
                id.indexOf('node_modules/yup') !== -1) {
              return 'form-validation'
            }
            
            // HTTP and API communication
            if (id.indexOf('node_modules/axios') !== -1) {
              return 'api-client'
            }
            
            // Remaining node_modules go into vendor chunk
            if (id.indexOf('node_modules') !== -1) {
              return 'vendor'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1200,
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : []
        },
        keep_classnames: !isProd,
        keep_fnames: !isProd
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      open: !isProd,
      hmr: {
        overlay: true
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    preview: {
      port: 5173,
      strictPort: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['web-vitals'],
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      legalComments: 'none'
    },
    css: {
      devSourcemap: isDevOrTest,
      postcss: isProd ? {} : undefined
    }
  }
})
