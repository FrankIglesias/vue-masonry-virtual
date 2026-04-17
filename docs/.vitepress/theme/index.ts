import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import BasicDemo from './components/BasicDemo.vue'
import ImageDemo from './components/ImageDemo.vue'
import ExpandDemo from './components/ExpandDemo.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BasicDemo', BasicDemo)
    app.component('ImageDemo', ImageDemo)
    app.component('ExpandDemo', ExpandDemo)
  },
} satisfies Theme
