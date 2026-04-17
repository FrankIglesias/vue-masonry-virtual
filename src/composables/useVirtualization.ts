import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { ItemPosition, VisibleItem } from '../types'

/**
 * Tracks scroll position inside a container and returns only the items
 * whose positions overlap the visible viewport (+ overscan buffer).
 */
export function useVirtualization<T>(
  containerRef: Ref<HTMLElement | null>,
  items: Ref<T[]>,
  positions: Ref<ItemPosition[]>,
  overscan: Ref<number>,
) {
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  let rafId: number | null = null

  function onScroll() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      const el = containerRef.value
      if (!el) return
      scrollTop.value = el.scrollTop
    })
  }

  function measureContainer(el: HTMLElement) {
    containerHeight.value = el.clientHeight
    scrollTop.value = el.scrollTop
  }

  let ro: ResizeObserver | null = null

  function attachListeners(el: HTMLElement) {
    el.addEventListener('scroll', onScroll, { passive: true })
    ro = new ResizeObserver(() => measureContainer(el))
    ro.observe(el)
    measureContainer(el)
  }

  function detachListeners(el: HTMLElement) {
    el.removeEventListener('scroll', onScroll)
    ro?.disconnect()
    ro = null
  }

  onMounted(() => {
    if (containerRef.value) attachListeners(containerRef.value)
  })

  watch(containerRef, (el, oldEl) => {
    if (oldEl) detachListeners(oldEl)
    if (el) attachListeners(el)
  })

  onUnmounted(() => {
    if (containerRef.value) detachListeners(containerRef.value)
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  const visibleItems = computed<VisibleItem<T>[]>(() => {
    const st = scrollTop.value
    const ch = containerHeight.value
    const ov = overscan.value
    const pos = positions.value
    const its = items.value

    const top = st - ov
    const bottom = st + ch + ov

    const result: VisibleItem<T>[] = []

    for (let i = 0; i < pos.length; i++) {
      const p = pos[i]
      if (p.y + p.height >= top && p.y <= bottom) {
        result.push({ item: its[i], index: i, pos: p })
      }
    }

    return result
  })

  return { visibleItems, scrollTop, containerHeight }
}
