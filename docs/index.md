---
layout: home

hero:
  name: "vue-masonry-virtual"
  text: "Virtualized masonry grid for Vue 3"
  tagline: Renders only what's visible. Handles any height. Zero config.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /guide/api
    - theme: alt
      text: View on GitHub
      link: https://github.com/FrankIglesias/vue-masonry-virtual

features:
  - icon: ⚡️
    title: Virtualized
    details: Only DOM nodes inside the viewport are rendered — scroll through 10,000 items with no performance drop.

  - icon: 📐
    title: Dynamic heights
    details: No need to know heights upfront. Items are measured after render via ResizeObserver and the layout corrects itself.

  - icon: 🔄
    title: Runtime changes
    details: Expand cards, lazy-load images, swap content — any height change triggers an automatic layout reflow.

  - icon: 📱
    title: Responsive columns
    details: Pass a fixed count or a breakpoint map like <code>{ 0:1, 640:2, 1024:3 }</code> and columns adapt to the container.

  - icon: 🔷
    title: TypeScript-first
    details: Generic <code>&lt;T&gt;</code> component, full type exports, and proper <code>.d.ts</code> declarations included.

  - icon: 🪶
    title: < 3 KB gzipped
    details: Zero runtime dependencies — only Vue 3 as a peer dep.
---
