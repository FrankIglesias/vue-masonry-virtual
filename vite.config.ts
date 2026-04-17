import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        vue(),
        dts({
          include: ['src'],
          outDir: 'dist/types',
          tsconfigPath: './tsconfig.lib.json',
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'VueVirtualMasonry',
          formats: ['es', 'cjs'],
          fileName: (fmt) => `index.${fmt}.js`,
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: { vue: 'Vue' },
            exports: 'named',
          },
        },
        outDir: 'dist',
      },
    }
  }

  return {
    plugins: [vue()],
    base: process.env.VITE_BASE ?? '/',
    resolve: {
      alias: { '@': resolve(__dirname, 'src') },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
    },
  }
})
