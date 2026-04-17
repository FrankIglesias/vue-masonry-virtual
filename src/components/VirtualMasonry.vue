<script setup lang="ts" generic="T">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useColumns } from '../composables/useColumns'
import { useMasonryLayout } from '../composables/useMasonryLayout'
import { useVirtualization } from '../composables/useVirtualization'
import type { ColumnBreakpoints } from '../types'

const props = withDefaults(
  defineProps<{
    items: T[]
    columns?: number | ColumnBreakpoints
    gap?: number
    estimatedHeight?: number
    overscan?: number
    getKey?: (item: T, index: number) => string | number
  }>(),
  {
    columns: 3,
    gap: 16,
    estimatedHeight: 300,
    overscan: 500,
    getKey: (_item: unknown, index: number) => index,
  },
)

const containerRef = ref<HTMLElement | null>(null)

const columnsRef = computed(() => props.columns)
const gapRef = computed(() => props.gap)
const overscanRef = computed(() => props.overscan)
const itemsRef = computed(() => props.items)

const { columnCount, containerWidth } = useColumns(containerRef, columnsRef)

const heights = ref<number[]>([])

watch(
  () => props.items.length,
  (newLen, oldLen = 0) => {
    const est = props.estimatedHeight
    if (newLen > oldLen) {
      heights.value.push(...Array(newLen - oldLen).fill(est))
    } else {
      heights.value.length = newLen
    }
  },
  { immediate: true },
)

watch(
  () => props.estimatedHeight,
  (next, prev) => {
    heights.value = heights.value.map((h) => (h === prev ? next : h))
  },
)

const itemCount = computed(() => props.items.length)
const layout = useMasonryLayout(itemCount, columnCount, containerWidth, gapRef, heights)
const positions = computed(() => layout.value.positions)
const totalHeight = computed(() => layout.value.totalHeight)

const { visibleItems } = useVirtualization(containerRef, itemsRef, positions, overscanRef)

const itemObservers = new Map<number, ResizeObserver>()

function observeItem(el: Element | null, index: number) {
  itemObservers.get(index)?.disconnect()
  itemObservers.delete(index)

  if (!el) return

  const ro = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const measured = entry.contentRect.height
    if (measured > 0 && heights.value[index] !== measured) {
      heights.value[index] = measured
    }
  })
  ro.observe(el)
  itemObservers.set(index, ro)
}

onUnmounted(() => {
  itemObservers.forEach((ro) => ro.disconnect())
  itemObservers.clear()
})

function resolveKey(item: T, index: number): string | number {
  return props.getKey(item, index)
}

defineExpose({ renderedCount: computed(() => visibleItems.value.length) })
</script>

<template>
  <div ref="containerRef" class="vm-container">
    <div class="vm-spacer" :style="{ height: `${totalHeight}px` }" />
    <div
      v-for="{ item, index, pos } in visibleItems"
      :key="resolveKey(item, index)"
      class="vm-item"
      :style="{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        width: `${pos.width}px`,
      }"
    >
      <div :ref="(el) => observeItem(el as Element | null, index)">
        <slot name="item" :item="item" :index="index" :width="pos.width" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vm-container {
  position: relative;
  overflow-y: auto;
  width: 100%;
  height: 100%;
}

.vm-spacer {
  pointer-events: none;
}

.vm-item {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
</style>
