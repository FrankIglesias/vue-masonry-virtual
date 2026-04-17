import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useMasonryLayout } from '../src/composables/useMasonryLayout'

function makeLayout(count: number, columns: number, width: number, gap: number, heights: number[]) {
  return useMasonryLayout(ref(count), ref(columns), ref(width), ref(gap), ref(heights))
}

describe('useMasonryLayout', () => {
  it('returns empty layout when there are no items', () => {
    const layout = makeLayout(0, 3, 900, 16, [])
    expect(layout.value.positions).toHaveLength(0)
    expect(layout.value.totalHeight).toBe(0)
  })

  it('returns empty layout when container width is 0', () => {
    const layout = makeLayout(4, 3, 0, 16, [100, 200, 150, 120])
    expect(layout.value.positions).toHaveLength(0)
  })

  it('calculates column width correctly for 3 columns', () => {
    // width=900, gap=16, 3 cols → colWidth = (900 - 32) / 3 = 289.33…
    const layout = makeLayout(3, 3, 900, 16, [100, 100, 100])
    const expected = (900 - 16 * 2) / 3
    layout.value.positions.forEach((p) => {
      expect(p.width).toBeCloseTo(expected)
    })
  })

  it('places first item in the first column at y=0', () => {
    const layout = makeLayout(1, 3, 900, 16, [200])
    expect(layout.value.positions[0].x).toBe(0)
    expect(layout.value.positions[0].y).toBe(0)
  })

  it('distributes items across columns shortest-first', () => {
    // 3 columns, 6 equal-height items → 2 per column
    const heights = [100, 100, 100, 100, 100, 100]
    const layout = makeLayout(6, 3, 300, 0, heights)
    const pos = layout.value.positions

    // Items 0,1,2 go to columns 0,1,2
    expect(pos[0].x).toBe(0) // col 0
    expect(pos[1].x).toBe(100) // col 1
    expect(pos[2].x).toBe(200) // col 2
    // Items 3,4,5 go back to columns 0,1,2 (all equal height)
    expect(pos[3].x).toBe(0)
    expect(pos[4].x).toBe(100)
    expect(pos[5].x).toBe(200)
  })

  it('stacks items vertically within a column', () => {
    // 2 columns, items of height 100 each, gap=10
    const layout = makeLayout(4, 2, 200, 10, [100, 100, 100, 100])
    const pos = layout.value.positions

    // Items 0 and 2 land in col 0
    expect(pos[0].y).toBe(0)
    expect(pos[2].y).toBe(110) // 100 + 10 gap

    // Items 1 and 3 land in col 1
    expect(pos[1].y).toBe(0)
    expect(pos[3].y).toBe(110)
  })

  it('always places new item in the shortest column', () => {
    // col 0 has a tall item, col 1 has a short item → item 2 should go to col 1
    const layout = makeLayout(3, 2, 200, 0, [300, 50, 50])
    const pos = layout.value.positions

    expect(pos[0].x).toBe(0) // col 0 (height 300)
    expect(pos[1].x).toBe(100) // col 1 (height 50)
    expect(pos[2].x).toBe(100) // col 1 is shorter → item 2 goes there
  })

  it('totalHeight equals the tallest column without trailing gap', () => {
    // 1 column, 2 items h=100, gap=20 → colHeight = 100+20+100+20 = 240, totalHeight = 240-20 = 220
    const layout = makeLayout(2, 1, 100, 20, [100, 100])
    expect(layout.value.totalHeight).toBe(220)
  })

  it('recomputes reactively when heights change', async () => {
    const heights = ref([100, 100, 100])
    const layout = useMasonryLayout(ref(3), ref(3), ref(300), ref(0), heights)

    expect(layout.value.totalHeight).toBe(100)

    heights.value[0] = 200
    await nextTick()

    expect(layout.value.totalHeight).toBe(200)
  })

  it('recomputes reactively when column count changes', async () => {
    const colCount = ref(3)
    const layout = useMasonryLayout(
      ref(6),
      colCount,
      ref(600),
      ref(0),
      ref([100, 100, 100, 100, 100, 100]),
    )

    const before = layout.value.totalHeight

    colCount.value = 2
    await nextTick()

    // With 2 columns, items stack more → totalHeight should be greater
    expect(layout.value.totalHeight).toBeGreaterThan(before)
  })

  it('handles a single column correctly', () => {
    const layout = makeLayout(3, 1, 100, 10, [50, 80, 60])
    const pos = layout.value.positions

    expect(pos.every((p) => p.x === 0)).toBe(true)
    expect(pos[0].y).toBe(0)
    expect(pos[1].y).toBe(60) // 50 + 10
    expect(pos[2].y).toBe(150) // 50 + 10 + 80 + 10
    expect(layout.value.totalHeight).toBe(210) // 50+10+80+10+60 = 210, -10 trailing = 210... wait
    // Actually: col accumulates 50+10 + 80+10 + 60+10 = 220, totalHeight = 220-10 = 210
    expect(layout.value.totalHeight).toBe(210)
  })
})
