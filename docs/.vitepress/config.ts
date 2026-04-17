import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
  title: 'vue-masonry-virtual',
  description: 'Virtualized masonry grid component for Vue 3',
  base: process.env.DOCS_BASE ?? '/',

  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],

  themeConfig: {
    logo: { light: '/logo-light.svg', dark: '/logo-dark.svg', alt: 'vue-masonry-virtual' },

    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/guide/api' },
      {
        text: '0.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/FrankIglesias/vue-masonry-virtual/releases' },
          { text: 'Contributing', link: 'https://github.com/FrankIglesias/vue-masonry-virtual/blob/main/README.md#contributing' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Examples', link: '/guide/examples' },
        ],
      },
      {
        text: 'Reference',
        items: [{ text: 'API', link: '/guide/api' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/FrankIglesias/vue-masonry-virtual' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/vue-masonry-virtual' },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Francisco Iglesias',
    },

    editLink: {
      pattern: 'https://github.com/FrankIglesias/vue-masonry-virtual/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  vite: {
    resolve: {
      alias: {
        'vue-masonry-virtual': resolve(__dirname, '../../src/index.ts'),
      },
    },
  },
})
