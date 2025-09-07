<!-- MediaInfo.vue Component -->
<template>
  <div class="media-info">
    <span class="media-name">{{ currentItem.name }}</span>
    <span class="queue-counter">{{ currentIndex + 1 }} / {{ queueLength }}</span>
  </div>
</template>

<script setup lang="ts">
interface MediaItem {
  name: string;
  [key: string]: any;
}

defineProps<{
  currentItem: MediaItem;
  currentIndex: number;
  queueLength: number;
}>();
</script>

<style scoped>
.media-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>