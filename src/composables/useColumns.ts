import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { ColumnBreakpoints } from '../types'

/**
 * Resolves the active column count from a fixed number or responsive breakpoint map.
 * Observes container width changes via ResizeObserver.
 */
export function useColumns(
  containerRef: Ref<HTMLElement | null>,
  columns: Ref<number | ColumnBreakpoints>,
) {
  const containerWidth = ref(0)

  let ro: ResizeObserver | null = null

  function observe(el: HTMLElement) {
    ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) containerWidth.value = entry.contentRect.width
    })
    ro.observe(el)
    containerWidth.value = el.getBoundingClientRect().width
  }

  onMounted(() => {
    if (containerRef.value) observe(containerRef.value)
  })

  watch(containerRef, (el, oldEl) => {
    ro?.disconnect()
    if (el) observe(el)
    else if (!oldEl) containerWidth.value = 0
  })

  onUnmounted(() => ro?.disconnect())

  const columnCount = computed(() => {
    const cols = columns.value
    if (typeof cols === 'number') return Math.max(1, cols)

    const width = containerWidth.value
    if (width === 0) return 1

    const breakpoints = Object.keys(cols)
      .map(Number)
      .sort((a, b) => b - a)
    const matched = breakpoints.find((bp) => width >= bp)
    const key = matched ?? breakpoints[breakpoints.length - 1]
    return Math.max(1, cols[key])
  })

  return { columnCount, containerWidth }
}
