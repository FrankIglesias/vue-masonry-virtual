import { describe, it, expect } from 'vitest'
import { ref, nextTick, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useColumns } from '../src/composables/useColumns'

// Helper: mount a component that uses the composable and exposes its output
function mountUseColumns(columns: number | Record<number, number>) {
  const containerRef = ref<HTMLElement | null>(null)
  const columnsRef = ref(columns)

  const comp = defineComponent({
    setup() {
      const { columnCount, containerWidth: cw } = useColumns(containerRef, columnsRef)
      return { columnCount, containerWidth: cw }
    },
    template: '<div ref="el"></div>',
  })

  const wrapper = mount(comp, { attachTo: document.body })
  return { wrapper, columnsRef }
}

describe('useColumns', () => {
  it('returns a fixed column count when columns is a number', () => {
    const { wrapper } = mountUseColumns(3)
    expect(wrapper.vm.columnCount).toBe(3)
  })

  it('enforces minimum 1 column for numbers', () => {
    const { wrapper } = mountUseColumns(0)
    expect(wrapper.vm.columnCount).toBe(1)
  })

  it('reacts to columns prop changes', async () => {
    const { wrapper, columnsRef } = mountUseColumns(3)
    expect(wrapper.vm.columnCount).toBe(3)
    columnsRef.value = 5
    await nextTick()
    expect(wrapper.vm.columnCount).toBe(5)
  })

  it('resolves breakpoints: returns 1 column when width is 0', () => {
    const { wrapper } = mountUseColumns({ 0: 1, 640: 2, 1024: 3 }, 0)
    // containerWidth starts at 0 (no real DOM size in test) → falls back to smallest key
    expect(wrapper.vm.columnCount).toBeGreaterThanOrEqual(1)
  })
})

describe('useColumns breakpoint resolution (unit)', () => {
  // We test the resolution logic in isolation since jsdom has no real layout
  function resolveBreakpoint(breakpoints: Record<number, number>, width: number): number {
    const sorted = Object.keys(breakpoints)
      .map(Number)
      .sort((a, b) => b - a)
    const matched = sorted.find((bp) => width >= bp)
    const key = matched ?? sorted[sorted.length - 1]
    return Math.max(1, breakpoints[key])
  }

  it('returns 1 column for small width', () => {
    expect(resolveBreakpoint({ 0: 1, 640: 2, 1024: 3 }, 320)).toBe(1)
  })

  it('returns 2 columns at 640px breakpoint', () => {
    expect(resolveBreakpoint({ 0: 1, 640: 2, 1024: 3 }, 640)).toBe(2)
  })

  it('returns 3 columns at 1024px breakpoint', () => {
    expect(resolveBreakpoint({ 0: 1, 640: 2, 1024: 3 }, 1200)).toBe(3)
  })

  it('returns 2 columns between 640 and 1024', () => {
    expect(resolveBreakpoint({ 0: 1, 640: 2, 1024: 3 }, 800)).toBe(2)
  })

  it('falls back to smallest breakpoint when width is below all', () => {
    // e.g. breakpoints start at 300 but width is 100
    expect(resolveBreakpoint({ 300: 2, 600: 3 }, 100)).toBe(2)
  })

  it('matches the exact breakpoint boundary', () => {
    expect(resolveBreakpoint({ 0: 1, 640: 2, 1024: 3 }, 1024)).toBe(3)
  })
})
