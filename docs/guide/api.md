# API Reference

## `<VirtualMasonry>`

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | **required** | Array of items to render |
| `columns` | `number \| Record<number, number>` | `3` | Fixed column count, or a responsive breakpoint map `{ minWidthPx: columnCount }` |
| `gap` | `number` | `16` | Gap between items in px |
| `estimatedHeight` | `number` | `300` | Height estimate used for initial layout before items are measured. Closer to the real height → less layout shift. |
| `overscan` | `number` | `500` | Extra px above and below the viewport to pre-render. Higher values reduce pop-in on fast scrolls. |
| `getKey` | `(item: T, index: number) => string \| number` | `index` | Unique key accessor. Always set this when items have stable IDs to prevent remounts. |

### Slot: `#item`

The only slot. Receives the item, its index in the array, and the column width.

```vue
<template #item="{ item, index, width }">
  <!--
    item  → T        — the original data object
    index → number   — position in the items array
    width → number   — computed column width in px
  -->
</template>
```

The `width` prop is especially useful for requesting correctly-sized images:

```vue
<template #item="{ item, width }">
  <img :src="`https://example.com/img/${item.id}?w=${Math.round(width)}`" />
</template>
```

### Exposed

Access via a template ref:

```vue
<script setup>
import { ref } from 'vue'
import { VirtualMasonry } from 'vue-masonry-virtual'

const masonry = ref()
</script>

<template>
  <VirtualMasonry ref="masonry" :items="items" ...>
    ...
  </VirtualMasonry>
</template>
```

| Property | Type | Description |
|---|---|---|
| `renderedCount` | `number` | Number of items currently rendered in the DOM |

---

## Types

All types are exported from the package root:

```ts
import type {
  ColumnBreakpoints,
  ItemPosition,
  MasonryLayout,
  VirtualMasonryProps,
  VisibleItem,
} from 'vue-masonry-virtual'
```

### `ColumnBreakpoints`

```ts
type ColumnBreakpoints = Record<number, number>
// e.g. { 0: 1, 640: 2, 1024: 3 }
```

### `ItemPosition`

```ts
interface ItemPosition {
  x: number
  y: number
  width: number
  height: number
}
```

### `VisibleItem<T>`

```ts
interface VisibleItem<T> {
  item: T
  index: number
  pos: ItemPosition
}
```

---

## Composables

The three composables that power the component are also exported for advanced use cases.

### `useColumns`

Resolves the active column count from a fixed number or responsive breakpoint map. Observes container width changes via `ResizeObserver`.

```ts
import { useColumns } from 'vue-masonry-virtual'

const { columnCount, containerWidth } = useColumns(containerRef, columnsRef)
```

### `useMasonryLayout`

Pure masonry layout algorithm. Places each item in the shortest column, returns absolute positions and total height. Recomputes reactively whenever inputs change.

```ts
import { useMasonryLayout } from 'vue-masonry-virtual'

const layout = useMasonryLayout(itemCount, columnCount, containerWidth, gap, heights)
// layout.value → { positions: ItemPosition[], totalHeight: number }
```

### `useVirtualization`

Tracks scroll position inside a container and returns only the items whose positions overlap the visible viewport plus overscan buffer.

```ts
import { useVirtualization } from 'vue-masonry-virtual'

const { visibleItems, scrollTop, containerHeight } = useVirtualization(
  containerRef,
  items,
  positions,
  overscan,
)
```
