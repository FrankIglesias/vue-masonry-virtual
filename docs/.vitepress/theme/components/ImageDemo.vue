<script setup lang="ts">
import { VirtualMasonry } from 'vue-virtual-masonry'

const ASPECT_RATIOS = [
  { ratio: '16 / 9', w: 640, h: 360 },
  { ratio: '4 / 3',  w: 600, h: 450 },
  { ratio: '1 / 1',  w: 500, h: 500 },
  { ratio: '3 / 4',  w: 450, h: 600 },
  { ratio: '2 / 3',  w: 400, h: 600 },
]

const items = Array.from({ length: 100 }, (_, i) => {
  const ar = ASPECT_RATIOS[i % ASPECT_RATIOS.length]
  return { id: i, imageId: (i % 100) + 1, ...ar }
})
</script>

<template>
  <div class="demo-wrap">
    <div class="demo-viewport">
      <VirtualMasonry
        :items="items"
        :columns="{ 0: 2, 700: 3 }"
        :gap="8"
        :estimated-height="320"
        :get-key="(item) => item.id"
      >
        <template #item="{ item }">
          <div class="img-card">
            <div class="img-wrap" :style="{ aspectRatio: item.ratio }">
              <img
                :src="`https://picsum.photos/seed/${item.imageId}/${item.w}/${item.h}`"
                :alt="`Photo ${item.id}`"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </template>
      </VirtualMasonry>
    </div>
    <div class="demo-label">100 images · varied aspect ratios · lazy loaded</div>
  </div>
</template>

<style scoped>
.demo-viewport {
  height: 420px;
}

.img-card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.07);
}

.img-wrap {
  width: 100%;
  background: #e4e4e7;
  overflow: hidden;
}

.img-wrap img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style>
