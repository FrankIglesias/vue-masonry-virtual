# vue-virtual-masonry

[![CI](https://img.shields.io/github/actions/workflow/status/FrankIglesias/vue-virtual-masonry/ci.yml?label=CI&logo=github)](https://github.com/FrankIglesias/vue-virtual-masonry/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/vue-virtual-masonry?color=41b883&logo=npm)](https://www.npmjs.com/package/vue-virtual-masonry)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-41b883?logo=vuedotjs)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?logo=typescript)](https://www.typescriptlang.org)

A high-performance **virtualized masonry grid** for Vue 3. Renders only the items visible in the viewport — no matter how many thousands of items you have — and handles dynamic heights automatically via `ResizeObserver`.

---

## Features

- **Virtualized** — only DOM nodes in the viewport are rendered
- **Dynamic heights** — measures items after render via `ResizeObserver`; corrects layout as content changes
- **Runtime height changes** — expand/collapse or lazy-load images? Layout re-flows automatically
- **Responsive columns** — fixed count or a breakpoint map `{ 0: 1, 640: 2, 1024: 3 }`
- **TypeScript-first** — generic `<T>` component, full type exports
- **Zero dependencies** — only Vue 3 as a peer dep
- **< 3 KB gzipped**

---

## Installation

```bash
npm install vue-virtual-masonry
```

---

## Quick Start

```vue
<script setup lang="ts">
import { VirtualMasonry } from 'vue-virtual-masonry'

const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }))
</script>

<template>
  <!-- Container must have an explicit height -->
  <div style="height: 100vh">
    <VirtualMasonry
      :items="items"
      :columns="{ 0: 1, 640: 2, 1024: 3 }"
      :gap="16"
      :estimated-height="200"
      :get-key="(item) => item.id"
    >
      <template #item="{ item }">
        <div class="card">{{ item.text }}</div>
      </template>
    </VirtualMasonry>
  </div>
</template>
```

> The `VirtualMasonry` component fills its parent — give that parent an explicit height and `overflow: hidden`.

---

## API

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | **required** | Array of items to render |
| `columns` | `number \| Record<number, number>` | `3` | Fixed column count, or a map of `{ minWidthPx: columnCount }` |
| `gap` | `number` | `16` | Gap between items in px |
| `estimatedHeight` | `number` | `300` | Initial height estimate used for layout before items are measured |
| `overscan` | `number` | `500` | Extra px above and below the viewport to pre-render |
| `getKey` | `(item: T, index: number) => string \| number` | `index` | Unique key accessor — set this to avoid remounting on reorder |

### Slot: `#item`

```vue
<template #item="{ item, index, width }">
  <!-- item  → T         — the original item object -->
  <!-- index → number    — its index in the items array -->
  <!-- width → number    — the computed column width in px (useful for images) -->
</template>
```

### Exposed

```ts
const masonryRef = ref<InstanceType<typeof VirtualMasonry>>()

// Number of items currently rendered in the DOM
masonryRef.value.renderedCount
```

---

## Examples

### Responsive columns

Pass a breakpoint map — keys are minimum container widths in px:

```vue
<VirtualMasonry
  :items="items"
  :columns="{ 0: 1, 640: 2, 1024: 3, 1280: 4 }"
/>
```

### Fixed column count

```vue
<VirtualMasonry :items="items" :columns="4" />
```

### Images with dynamic heights

The `width` slot prop lets you request the exact right image size. The `ResizeObserver` catches the height change after the image loads and corrects the layout automatically.

```vue
<template #item="{ item, width }">
  <div class="card">
    <img
      :src="`https://picsum.photos/seed/${item.id}/${Math.round(width)}/300`"
      style="width: 100%; display: block"
      loading="lazy"
    />
    <p>{{ item.caption }}</p>
  </div>
</template>
```

### Expand/collapse (runtime height changes)

No special handling needed — just change the content and `ResizeObserver` takes care of the rest:

```vue
<script setup>
function toggle(item) {
  const arr = [...items.value]
  const i = arr.findIndex(x => x.id === item.id)
  arr[i] = { ...arr[i], open: !arr[i].open }
  items.value = arr
}
</script>

<template #item="{ item }">
  <div class="card" @click="toggle(item)">
    <h3>{{ item.title }}</h3>
    <p v-if="item.open">{{ item.longText }}</p>
  </div>
</template>
```

### Custom key

Always set `getKey` when your items have stable IDs — it prevents unnecessary remounts when the array changes:

```vue
<VirtualMasonry :items="items" :get-key="(item) => item.uuid" />
```

---

## How it works

```
┌──────────────────────────────────────────┐
│  VirtualMasonry container (overflow-y)   │
│                                          │
│  ┌── invisible spacer (full height) ──┐  │
│  │                                    │  │
│  │  ← sets scrollbar size             │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─ item (absolute) ─┐  ┌─ item ──────┐  │
│  │  rendered because │  │  rendered   │  │  ← visible + overscan
│  │  it's in viewport │  │             │  │
│  └───────────────────┘  └─────────────┘  │
│                                          │
│  (items below viewport are not in DOM)   │
└──────────────────────────────────────────┘
```

1. **Layout** — `useMasonryLayout` runs the shortest-column algorithm on a heights array, producing absolute `{ x, y, width, height }` for every item.
2. **Virtualization** — `useVirtualization` tracks scroll position (rAF-throttled) and filters to only the items that overlap `[scrollTop - overscan, scrollTop + containerHeight + overscan]`.
3. **Height correction** — each rendered item wrapper has a `ResizeObserver`. When the browser measures a different height than the estimate, the heights array is updated, the layout recomputes, and items reposition.

---

## Local Development

```bash
git clone https://github.com/FrankIglesias/vue-virtual-masonry.git
cd vue-virtual-masonry
npm install

# Start the demo app
npm run dev

# Run tests
npm test

# Build the library
npm run build:lib

# Lint
npm run lint:check
```

---

## Contributing

Issues and pull requests are welcome. Please make sure `npm test` and `npm run lint:check` pass before opening a PR.

---

## License

[MIT](./LICENSE) © Francisco Iglesias
