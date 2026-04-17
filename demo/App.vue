<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onUnmounted } from 'vue'
import VirtualMasonry from '../src/components/VirtualMasonry.vue'

interface DemoItem {
  id: number
  title: string
  body: string
  tag: string
  expanded: boolean
  imageId: number
  aspectRatio: string
  imgW: number
  imgH: number
}

const itemCount = ref(500)
const columnConfig = ref<'fixed' | 'responsive'>('responsive')
const fixedColumns = ref(3)
const gap = ref(12)
const estimatedHeight = ref(380)
const overscan = ref(600)

const columns = computed(() =>
  columnConfig.value === 'responsive'
    ? { 0: 1, 500: 2, 800: 3, 1100: 4, 1400: 5 }
    : fixedColumns.value,
)

const TAGS = ['Vue', 'TypeScript', 'CSS', 'Performance', 'UI', 'DX', 'Grid', 'Layout']

const ASPECT_RATIOS: Array<{ ratio: string; w: number; h: number }> = [
  { ratio: '16 / 9', w: 640, h: 360 },
  { ratio: '4 / 3', w: 600, h: 450 },
  { ratio: '1 / 1', w: 500, h: 500 },
  { ratio: '3 / 4', w: 450, h: 600 },
  { ratio: '2 / 3', w: 400, h: 600 },
]

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'

function makeItem(id: number): DemoItem {
  const seed = (id * 7 + 13) % 100
  const bodyLength = 40 + (seed % 4) * 55
  const ar = ASPECT_RATIOS[id % ASPECT_RATIOS.length]
  return {
    id,
    title: `Card #${id}`,
    body: LOREM.slice(0, bodyLength),
    tag: TAGS[id % TAGS.length],
    expanded: false,
    imageId: (id % 300) + 1,
    aspectRatio: ar.ratio,
    imgW: ar.w,
    imgH: ar.h,
  }
}

function imageUrl(item: DemoItem): string {
  return `https://picsum.photos/seed/${item.imageId}/${item.imgW}/${item.imgH}`
}

const items = shallowRef<DemoItem[]>([])

function generateItems(count: number) {
  const arr: DemoItem[] = []
  for (let i = 0; i < count; i++) arr.push(makeItem(i))
  items.value = arr
}

onMounted(() => generateItems(itemCount.value))

function applyCount() {
  generateItems(itemCount.value)
}

function toggleExpand(item: DemoItem) {
  const arr = [...items.value]
  const idx = arr.findIndex((i) => i.id === item.id)
  if (idx === -1) return
  arr[idx] = { ...arr[idx], expanded: !arr[idx].expanded }
  items.value = arr
}

function randomizeHeights() {
  const arr = [...items.value]
  const count = Math.floor(arr.length * 0.1)
  const used = new Set<number>()
  while (used.size < count) used.add(Math.floor(Math.random() * arr.length))
  used.forEach((i) => {
    arr[i] = { ...arr[i], expanded: !arr[i].expanded }
  })
  items.value = arr
}

const masonryRef = ref<InstanceType<typeof VirtualMasonry> | null>(null)
const renderedCount = computed(() => masonryRef.value?.renderedCount ?? 0)

const fps = ref(0)
let frameCount = 0
let lastTime = performance.now()
let rafHandle = 0

function countFps() {
  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (now - lastTime))
    frameCount = 0
    lastTime = now
  }
  rafHandle = requestAnimationFrame(countFps)
}

onMounted(() => {
  rafHandle = requestAnimationFrame(countFps)
})
onUnmounted(() => cancelAnimationFrame(rafHandle))

const perfMs = ref<string | null>(null)

function measurePerf() {
  performance.mark('masonry-start')
  generateItems(itemCount.value)
  requestAnimationFrame(() => {
    performance.mark('masonry-end')
    performance.measure('masonry-render', 'masonry-start', 'masonry-end')
    const entry = performance.getEntriesByName('masonry-render').pop()
    if (entry) perfMs.value = `${entry.duration.toFixed(1)} ms`
    performance.clearMeasures('masonry-render')
  })
}

function getKey(item: DemoItem) {
  return item.id
}
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <h2>Vue Virtual Masonry</h2>
      <p class="subtitle">Virtualized masonry grid for Vue 3</p>

      <section>
        <label>Items <strong>{{ itemCount.toLocaleString() }}</strong></label>
        <input v-model.number="itemCount" type="range" min="100" max="10000" step="100" />
        <button @click="applyCount">Apply</button>
      </section>

      <section>
        <label>Columns</label>
        <div class="radio-group">
          <label><input v-model="columnConfig" type="radio" value="responsive" /> Responsive</label>
          <label><input v-model="columnConfig" type="radio" value="fixed" /> Fixed</label>
        </div>
        <div v-if="columnConfig === 'fixed'" class="inline">
          <input v-model.number="fixedColumns" type="number" min="1" max="8" style="width: 60px" />
        </div>
        <div v-else class="breakpoint-hint">0→1 · 500→2 · 800→3 · 1100→4 · 1400→5</div>
      </section>

      <section>
        <label>Gap <strong>{{ gap }}px</strong></label>
        <input v-model.number="gap" type="range" min="0" max="48" />
      </section>

      <section>
        <label>Estimated height <strong>{{ estimatedHeight }}px</strong></label>
        <input v-model.number="estimatedHeight" type="range" min="50" max="800" step="10" />
      </section>

      <section>
        <label>Overscan <strong>{{ overscan }}px</strong></label>
        <input v-model.number="overscan" type="range" min="0" max="2000" step="100" />
      </section>

      <hr />

      <section>
        <h3>Runtime height changes</h3>
        <p class="hint">Click any card to expand/collapse it. Layout corrects automatically.</p>
        <button @click="randomizeHeights">Randomize 10% heights</button>
      </section>

      <hr />

      <section>
        <h3>Performance</h3>
        <button @click="measurePerf">Remount &amp; measure</button>
        <div v-if="perfMs" class="stat">Render: {{ perfMs }}</div>
      </section>

      <hr />

      <section class="stats">
        <h3>Stats</h3>
        <div class="stat">
          <span>Total items</span>
          <strong>{{ items.length.toLocaleString() }}</strong>
        </div>
        <div class="stat">
          <span>DOM nodes</span>
          <strong class="highlight">{{ renderedCount }}</strong>
        </div>
        <div class="stat">
          <span>FPS</span>
          <strong :class="fps >= 55 ? 'good' : fps >= 30 ? 'ok' : 'bad'">{{ fps }}</strong>
        </div>
      </section>
    </aside>

    <main class="grid-area">
      <VirtualMasonry
        ref="masonryRef"
        :items="items"
        :columns="columns"
        :gap="gap"
        :estimated-height="estimatedHeight"
        :overscan="overscan"
        :get-key="getKey"
      >
        <template #item="{ item, width }">
          <div class="card" @click="toggleExpand(item)">
            <div class="card-img-wrap" :style="{ aspectRatio: item.aspectRatio }">
              <img
                :src="imageUrl(item)"
                :alt="item.title"
                class="card-img"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="card-body">
              <div class="card-tag">{{ item.tag }}</div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.body }}</p>

              <div v-if="item.expanded" class="card-extra">
                <p>
                  Layout corrected via ResizeObserver after this card expanded. Column widths are
                  computed from the container — this card received
                  <code>{{ Math.round(width) }}px</code>.
                </p>
              </div>

              <div class="card-footer">{{ item.expanded ? '▲ collapse' : '▼ expand' }}</div>
            </div>
          </div>
        </template>
      </VirtualMasonry>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  overflow-y: auto;
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 20px 16px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar h2 {
  font-size: 16px;
  color: #cba6f7;
  margin: 0 0 2px;
}

.subtitle {
  font-size: 11px;
  color: #6c7086;
  margin: 0 0 16px;
}

.sidebar h3 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #89b4fa;
  margin: 0 0 6px;
}

.sidebar section {
  margin-bottom: 14px;
}

.sidebar label {
  display: block;
  margin-bottom: 4px;
  color: #a6adc8;
}

.sidebar input[type='range'] {
  width: 100%;
  accent-color: #cba6f7;
}

.sidebar button {
  background: #313244;
  color: #cdd6f4;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 6px;
  width: 100%;
  transition: background 0.15s;
}

.sidebar button:hover {
  background: #45475a;
}

.hint {
  font-size: 11px;
  color: #6c7086;
  margin: 0 0 6px;
  line-height: 1.4;
}

.radio-group {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
}

.breakpoint-hint {
  font-size: 10px;
  color: #585b70;
  font-family: monospace;
}

hr {
  border: none;
  border-top: 1px solid #313244;
  margin: 8px 0;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #a6adc8;
}

.stat .highlight {
  color: #a6e3a1;
}
.stat .good {
  color: #a6e3a1;
}
.stat .ok {
  color: #f9e2af;
}
.stat .bad {
  color: #f38ba8;
}

.grid-area {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    transform 0.1s;
  user-select: none;
}

.card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-img-wrap {
  width: 100%;
  background: #e4e4e7;
  overflow: hidden;
  display: block;
}

.card-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-img:not([src='']) {
  opacity: 1;
}

.card-body {
  padding: 12px 14px 10px;
}

.card-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6d6d8a;
  background: #f1f0f8;
  border-radius: 4px;
  padding: 2px 7px;
  margin-bottom: 7px;
}

.card h4 {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 600;
  color: #18181b;
  line-height: 1.3;
}

.card p {
  margin: 0 0 4px;
  font-size: 13px;
  color: #52525b;
  line-height: 1.5;
}

.card-extra {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f4f4f5;
}

.card-extra code {
  font-family: monospace;
  font-size: 12px;
  background: #f4f4f5;
  padding: 1px 5px;
  border-radius: 3px;
  color: #7c3aed;
}

.card-footer {
  margin-top: 8px;
  font-size: 11px;
  color: #a1a1aa;
  text-align: right;
}
</style>
