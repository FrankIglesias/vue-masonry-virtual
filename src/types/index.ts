export type ColumnBreakpoints = Record<number, number>

export interface ItemPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface MasonryLayout {
  positions: ItemPosition[]
  totalHeight: number
}

export interface VirtualMasonryProps<T = unknown> {
  items: T[]
  columns?: number | ColumnBreakpoints
  gap?: number
  estimatedHeight?: number
  overscan?: number
  getKey?: (item: T, index: number) => string | number
}

export interface VisibleItem<T = unknown> {
  item: T
  index: number
  pos: ItemPosition
}
