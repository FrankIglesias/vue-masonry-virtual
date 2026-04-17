<script setup lang="ts">
import { shallowRef } from 'vue'
import { VirtualMasonry } from 'vue-masonry-virtual'

const EXTRA = 'The layout engine detected a height change via ResizeObserver and repositioned all items below this card automatically — no manual intervention needed.'

const initial = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  title: `Card #${i}`,
  expanded: false,
}))

const items = shallowRef(initial)

function toggle(id: number) {
  items.value = items.value.map((item) =>
    item.id === id ? { ...item, expanded: !item.expanded } : item,
  )
}
</script>

<template>
  <div class="demo-wrap">
    <div class="demo-viewport">
      <VirtualMasonry
        :items="items"
        :columns="3"
        :gap="10"
        :estimated-height="72"
        :get-key="(item) => item.id"
      >
        <template #item="{ item }">
          <div class="card" :class="{ expanded: item.expanded }" @click="toggle(item.id)">
            <div class="card-header">
              <span>{{ item.title }}</span>
              <span class="toggle-icon">{{ item.expanded ? '▲' : '▼' }}</span>
            </div>
            <p v-if="item.expanded" class="extra">{{ EXTRA }}</p>
          </div>
        </template>
      </VirtualMasonry>
    </div>
    <div class="demo-label">Click any card to expand — layout corrects automatically</div>
  </div>
</template>

<style scoped>
.demo-viewport {
  height: 420px;
}

.card {
  border-radius: 8px;
  border: 1px solid #e4e4e7;
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-size: 13px;
}

.card:hover {
  border-color: #41b883;
}

.card.expanded {
  border-color: #41b883;
  box-shadow: 0 0 0 3px rgba(65, 184, 131, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #18181b;
}

.toggle-icon {
  font-size: 10px;
  color: #41b883;
}

.extra {
  margin: 10px 0 0;
  color: #52525b;
  line-height: 1.5;
}
</style>
