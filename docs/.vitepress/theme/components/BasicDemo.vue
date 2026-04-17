<script setup lang="ts">
import { ref } from 'vue'
import { VirtualMasonry } from 'vue-masonry-virtual'

const COLORS = ['#e8f4fd','#fef9e7','#eafaf1','#fdf2f8','#f0f4c3','#e8eaf6','#fce4ec','#e0f2f1']
const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const columns = ref(3)

const items = Array.from({ length: 200 }, (_, i) => {
  const seed = (i * 7 + 13) % 100
  return {
    id: i,
    text: LOREM.slice(0, 40 + (seed % 5) * 50),
    color: COLORS[i % COLORS.length],
    label: `#${i}`,
  }
})
</script>

<template>
  <div class="demo-wrap">
    <div class="demo-viewport">
      <VirtualMasonry
        :items="items"
        :columns="columns"
        :gap="10"
        :estimated-height="100"
        :get-key="(item) => item.id"
      >
        <template #item="{ item }">
          <div class="card" :style="{ background: item.color }">
            <span class="card-label">{{ item.label }}</span>
            <p>{{ item.text }}</p>
          </div>
        </template>
      </VirtualMasonry>
    </div>
    <div class="demo-label">
      <label>
        Columns:
        <input v-model.number="columns" type="range" min="1" max="5" style="vertical-align: middle; margin: 0 6px" />
        {{ columns }}
      </label>
      &nbsp;·&nbsp; 200 items, only visible ones are in the DOM
    </div>
  </div>
</template>

<style scoped>
.demo-viewport {
  height: 420px;
}

.card {
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0,0,0,0.06);
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.card-label {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #888;
  margin-bottom: 6px;
}

.card p {
  margin: 0;
}
</style>
