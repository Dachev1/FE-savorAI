import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { splitVendorChunkPlugin } from 'vite';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var isProd = mode === 'production';
    var isDevOrTest = !isProd;
    return {
        plugins: [
            react(),
            splitVendorChunkPlugin()
        ],
        build: {
            target: 'esnext',
            minify: isProd ? 'terser' : false,
            sourcemap: isDevOrTest,
            // Reduce disk space by not inlining assets
            assetsInlineLimit: 4096,
            // Optimize build performance
            emptyOutDir: true,
            // Add hashes to file names for better caching
            rollupOptions: {
                output: {
                    // Use content hashing for better cache control
                    entryFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
                    chunkFileNames: isProd ? 'assets/[name].[hash].js' : 'assets/[name].js',
                    assetFileNames: isProd ? 'assets/[name].[hash].[ext]' : 'assets/[name].[ext]',
                    manualChunks: function (id) {
                        // React and related core packages
                        if (id.indexOf('node_modules/react') !== -1 ||
                            id.indexOf('node_modules/react-dom') !== -1 ||
                            id.indexOf('node_modules/scheduler') !== -1) {
                            return 'react-core';
                        }
                        // React router and related navigation
                        if (id.indexOf('node_modules/react-router') !== -1 ||
                            id.indexOf('node_modules/history') !== -1 ||
                            id.indexOf('node_modules/@remix-run') !== -1) {
                            return 'react-routing';
                        }
                        // UI components and icons
                        if (id.indexOf('node_modules/react-icons') !== -1 ||
                            id.indexOf('node_modules/@heroicons') !== -1 ||
                            id.indexOf('node_modules/tailwind') !== -1 ||
                            id.indexOf('node_modules/classnames') !== -1 ||
                            id.indexOf('node_modules/aos') !== -1) {
                            return 'ui-components';
                        }
                        // Date and utility libraries
                        if (id.indexOf('node_modules/date-fns') !== -1 ||
                            id.indexOf('node_modules/lodash') !== -1 ||
                            id.indexOf('node_modules/uuid') !== -1) {
                            return 'utils';
                        }
                        // Form handling libraries
                        if (id.indexOf('node_modules/formik') !== -1 ||
                            id.indexOf('node_modules/yup') !== -1 ||
                            id.indexOf('node_modules/validator') !== -1) {
                            return 'form-validation';
                        }
                        // HTTP and API communication
                        if (id.indexOf('node_modules/axios') !== -1 ||
                            id.indexOf('node_modules/qs') !== -1 ||
                            id.indexOf('node_modules/query-string') !== -1) {
                            return 'api-client';
                        }
                        // Remaining node_modules go into vendor chunk
                        if (id.indexOf('node_modules') !== -1) {
                            return 'vendor';
                        }
                    },
                },
            },
            // Increase size limit for warnings to reduce noise
            chunkSizeWarningLimit: 1200,
            terserOptions: {
                compress: {
                    drop_console: isProd,
                    drop_debugger: isProd,
                    pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : []
                },
                // Keep classnames for better debugging
                keep_classnames: !isProd,
                keep_fnames: !isProd
            }
        },
        server: {
            port: 5173,
            strictPort: true,
            open: !isProd, // Automatically open browser in dev mode
            hmr: {
                overlay: true // Show errors as overlay
            },
            proxy: {
                '/api': {
                    target: 'http://localhost:8081',
                    changeOrigin: true,
                    secure: false,
                    rewrite: function (path) { return path.replace(/^\/api/, ''); }
                }
            }
        },
        preview: {
            port: 5173,
            strictPort: true,
            open: true, // Open browser in preview mode too
        },
        esbuild: {
            logOverride: { 'this-is-undefined-in-esm': 'silent' },
            // Faster builds
            legalComments: 'none'
        },
        // Improve CSS handling
        css: {
            devSourcemap: isDevOrTest,
            // Optimize CSS in production - simplified to avoid require() issues
            postcss: isProd ? {} : undefined
        },
        // Improve caching during development
        optimizeDeps: {
            // Force these dependencies to be pre-bundled for better performance
            include: ['react', 'react-dom', 'react-router-dom']
        }
    };
});
