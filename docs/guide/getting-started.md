# Getting Started

## Installation

::: code-group

```bash [npm]
npm install vue-masonry-virtual
```

```bash [pnpm]
pnpm add vue-masonry-virtual
```

```bash [yarn]
yarn add vue-masonry-virtual
```

:::

**Requirements:** Vue 3.3+

---

## Quick Start

```vue
<script setup lang="ts">
import { VirtualMasonry } from 'vue-masonry-virtual'

const items = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  text: `Item ${i}`,
}))
</script>

<template>
  <!-- The container must have an explicit height -->
  <div style="height: 100vh">
    <VirtualMasonry
      :items="items"
      :columns="{ 0: 1, 640: 2, 1024: 3 }"
      :gap="16"
      :estimated-height="120"
      :get-key="(item) => item.id"
    >
      <template #item="{ item }">
        <div class="card">{{ item.text }}</div>
      </template>
    </VirtualMasonry>
  </div>
</template>
```

::: tip Container height
`VirtualMasonry` fills its parent with `width: 100%; height: 100%`. Give the parent an explicit height — `100vh`, a fixed `px` value, or `flex: 1` inside a flex container.
:::

---

## Live Demo

<BasicDemo />

---

## How it works

```
┌─────────────────────────────────────────────┐
│  VirtualMasonry (overflow-y: auto)           │
│                                              │
│  ┌─ invisible spacer (full height) ────────┐ │
│  │  ← sets the scrollbar height            │ │
│  └──────────────────────────────────────── ┘ │
│                                              │
│  ┌─ item (absolute) ─┐  ┌─ item ──────────┐  │
│  │  in viewport →    │  │  in viewport    │  │
│  │  rendered         │  │  rendered       │  │
│  └───────────────────┘  └─────────────────┘  │
│                                              │
│  (items below viewport are not in the DOM)   │
└─────────────────────────────────────────────┘
```

1. **Layout** — the masonry algorithm places each item in the shortest column, producing `{ x, y, width, height }` positions for all items.
2. **Virtualization** — only items that overlap `[scrollTop − overscan, scrollTop + containerHeight + overscan]` are rendered. The rest are absent from the DOM entirely.
3. **Height correction** — each rendered item has a `ResizeObserver`. When the measured height differs from the estimate, the heights array updates, the layout recomputes, and positions correct automatically.
