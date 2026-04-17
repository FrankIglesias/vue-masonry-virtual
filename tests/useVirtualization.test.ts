import { describe, it, expect } from 'vitest'

// We test the visibility filter logic independently of the DOM
// (The composable's scroll-tracking relies on browser events, tested in e2e)

type Position = { x: number; y: number; width: number; height: number }

function getVisibleIndices(
  positions: Position[],
  scrollTop: number,
  containerHeight: number,
  overscan: number,
): number[] {
  const top = scrollTop - overscan
  const bottom = scrollTop + containerHeight + overscan
  return positions
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.y + p.height >= top && p.y <= bottom)
    .map(({ i }) => i)
}

describe('virtualization visibility filter', () => {
  const positions: Position[] = [
    { x: 0, y: 0, width: 100, height: 100 }, // 0: y 0–100
    { x: 0, y: 116, width: 100, height: 200 }, // 1: y 116–316
    { x: 0, y: 332, width: 100, height: 150 }, // 2: y 332–482
    { x: 0, y: 498, width: 100, height: 100 }, // 3: y 498–598
    { x: 0, y: 614, width: 100, height: 300 }, // 4: y 614–914
    { x: 0, y: 930, width: 100, height: 100 }, // 5: y 930–1030
  ]

  it('shows all items when viewport covers everything', () => {
    const visible = getVisibleIndices(positions, 0, 2000, 0)
    expect(visible).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('shows only items in initial viewport (no overscan)', () => {
    // viewport: 0–400
    const visible = getVisibleIndices(positions, 0, 400, 0)
    expect(visible).toContain(0)
    expect(visible).toContain(1)
    expect(visible).toContain(2)
    expect(visible).not.toContain(3)
    expect(visible).not.toContain(4)
    expect(visible).not.toContain(5)
  })

  it('extends range with overscan', () => {
    // viewport: 0–400, overscan=200 → renders up to 600
    const visible = getVisibleIndices(positions, 0, 400, 200)
    expect(visible).toContain(3) // y=498, within 0–600
    expect(visible).not.toContain(4) // y=614, outside 0–600
  })

  it('works correctly when scrolled down', () => {
    // viewport: scrollTop=500, height=200 → 500–700
    const visible = getVisibleIndices(positions, 500, 200, 0)
    expect(visible).toContain(3) // y 498–598, overlaps 500–700
    expect(visible).toContain(4) // y 614–914, overlaps 500–700
    expect(visible).not.toContain(0)
    expect(visible).not.toContain(1)
    expect(visible).not.toContain(5) // y 930, outside 500–700
  })

  it('includes items that partially overlap the top edge', () => {
    // viewport: scrollTop=80, height=200 → 80–280
    // item 0: y 0–100 → partial overlap at bottom
    const visible = getVisibleIndices(positions, 80, 200, 0)
    expect(visible).toContain(0)
  })

  it('includes items that partially overlap the bottom edge', () => {
    // viewport: 0–120, item 1 starts at y=116 → partial overlap
    const visible = getVisibleIndices(positions, 0, 120, 0)
    expect(visible).toContain(1)
  })

  it('renders no items when scrolled past all content', () => {
    const visible = getVisibleIndices(positions, 5000, 600, 0)
    expect(visible).toHaveLength(0)
  })

  it('handles empty positions array', () => {
    const visible = getVisibleIndices([], 0, 600, 0)
    expect(visible).toHaveLength(0)
  })
})

describe('virtualization — height change handling', () => {
  it('re-evaluates visibility after a height change shifts items down', () => {
    // Simulate item 0 growing from 100 → 500, pushing item 1 down
    const after: Position[] = [
      { x: 0, y: 0, width: 100, height: 500 }, // 0 grew
      { x: 0, y: 516, width: 100, height: 200 }, // 1 shifted down
    ]
    // viewport 0–600
    const visible = getVisibleIndices(after, 0, 600, 0)
    expect(visible).toContain(0)
    expect(visible).toContain(1) // still in viewport at y=516
  })

  it('item shifted below viewport is not rendered', () => {
    // item 1 pushed to y=700 (outside 0–600 viewport)
    const after: Position[] = [
      { x: 0, y: 0, width: 100, height: 680 },
      { x: 0, y: 696, width: 100, height: 200 },
    ]
    const visible = getVisibleIndices(after, 0, 600, 0)
    expect(visible).toContain(0)
    expect(visible).not.toContain(1)
  })
})
