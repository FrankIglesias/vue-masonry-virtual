import { computed, type Ref } from 'vue'
import type { MasonryLayout, ItemPosition } from '../types'

/**
 * Pure masonry layout algorithm.
 * Places each item in the shortest column, returns absolute positions + total height.
 * Recomputes reactively whenever inputs change.
 */
export function useMasonryLayout(
  itemCount: Ref<number>,
  columnCount: Ref<number>,
  containerWidth: Ref<number>,
  gap: Ref<number>,
  heights: Ref<number[]>,
): Ref<MasonryLayout> {
  return computed<MasonryLayout>(() => {
    const count = columnCount.value
    const width = containerWidth.value
    const g = gap.value
    const h = heights.value
    const n = itemCount.value

    if (width === 0 || count === 0 || n === 0) {
      return { positions: [], totalHeight: 0 }
    }

    const colWidth = (width - g * (count - 1)) / count
    const colHeights = new Array<number>(count).fill(0)
    const positions: ItemPosition[] = []

    for (let i = 0; i < n; i++) {
      const col = shortestColumn(colHeights)
      const itemHeight = h[i] ?? 0

      positions.push({
        x: col * (colWidth + g),
        y: colHeights[col],
        width: colWidth,
        height: itemHeight,
      })

      colHeights[col] += itemHeight + g
    }

    const maxColHeight = Math.max(...colHeights)
    const totalHeight = maxColHeight > 0 ? maxColHeight - g : 0

    return { positions, totalHeight }
  })
}

function shortestColumn(heights: number[]): number {
  let minIdx = 0
  for (let i = 1; i < heights.length; i++) {
    if (heights[i] < heights[minIdx]) minIdx = i
  }
  return minIdx
}
