# Examples

## Responsive columns

Pass a breakpoint map — keys are **minimum container widths** in px:

```vue
<VirtualMasonry
  :items="items"
  :columns="{ 0: 1, 640: 2, 1024: 3, 1280: 4 }"
/>
```

Columns update automatically whenever the container resizes. Drag the browser window to see it in action below:

<BasicDemo />

---

## Images with lazy loading

Use the `width` slot prop to request the correctly-sized image. The layout reserves space via `aspect-ratio` before the image loads, then `ResizeObserver` catches any correction after.

```vue
<VirtualMasonry :items="items" :columns="3" :estimated-height="320">
  <template #item="{ item, width }">
    <div style="border-radius: 8px; overflow: hidden">
      <div :style="{ aspectRatio: item.ratio, background: '#e4e4e7' }">
        <img
          :src="`https://picsum.photos/seed/${item.id}/${Math.round(width)}/400`"
          style="width: 100%; height: 100%; object-fit: cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </template>
</VirtualMasonry>
```

<ImageDemo />

---

## Expand / collapse (runtime height changes)

No special handling is required — change the content and `ResizeObserver` takes care of repositioning.

```vue
<script setup>
import { shallowRef } from 'vue'

const items = shallowRef(
  Array.from({ length: 200 }, (_, i) => ({ id: i, expanded: false }))
)

function toggle(id) {
  items.value = items.value.map(item =>
    item.id === id ? { ...item, expanded: !item.expanded } : item
  )
}
</script>

<template>
  <VirtualMasonry :items="items" :columns="3" :get-key="item => item.id">
    <template #item="{ item }">
      <div class="card" @click="toggle(item.id)">
        <h4>Card #{{ item.id }}</h4>
        <p v-if="item.expanded">Extra content that makes this card taller.</p>
      </div>
    </template>
  </VirtualMasonry>
</template>
```

<ExpandDemo />

---

## Performance at scale

`VirtualMasonry` keeps the number of DOM nodes constant regardless of total item count. With `overscan: 500` (default), only the items within ~500px above and below the viewport are rendered.

```vue
<script setup>
// 10,000 items — no problem
const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i }))
</script>

<template>
  <div style="height: 100vh">
    <VirtualMasonry
      :items="items"
      :columns="4"
      :estimated-height="200"
      :overscan="800"
      :get-key="item => item.id"
    >
      <template #item="{ item }">
        <div>{{ item.id }}</div>
      </template>
    </VirtualMasonry>
  </div>
</template>
```

::: tip Tuning overscan
- **Lower overscan** → fewer DOM nodes, but items may pop in during fast scrolls.
- **Higher overscan** → smoother scrolling experience, slightly more DOM nodes.

A value between `400` and `800` works well for most cases.
:::

---

## Custom key

Always provide `getKey` when items have stable IDs. Without it, items are keyed by index — causing unnecessary remounts when the array is reordered or filtered.

```vue
<VirtualMasonry
  :items="items"
  :get-key="(item) => item.uuid"
/>
```

---

## Using composables directly

If you need full control, you can compose the primitives yourself:

```ts
import {
  useColumns,
  useMasonryLayout,
  useVirtualization,
} from 'vue-masonry-virtual'

const containerRef = ref(null)

const { columnCount, containerWidth } = useColumns(containerRef, ref(3))

const heights = ref(items.map(() => 300))

const layout = useMasonryLayout(
  computed(() => items.length),
  columnCount,
  containerWidth,
  ref(16),
  heights,
)

const { visibleItems } = useVirtualization(
  containerRef,
  ref(items),
  computed(() => layout.value.positions),
  ref(500),
)
```
