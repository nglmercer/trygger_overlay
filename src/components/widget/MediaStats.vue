<!-- MediaStats.vue Component -->
<template>
  <div class="queue-status">
    <span>Queue: {{ queueLength }} items</span>
    <span v-if="currentItem && !currentItem.maxDuration">
      Time left: {{ Math.max(0, Math.ceil(timeRemaining / 1000)) }}s
    </span>
    <span v-if="currentItem">
      Type: {{ currentItem.type }}
    </span>
    <span v-if="currentItem">
      Size: {{ currentItem.size }}%
    </span>
    <span v-if="currentItem">
      Volume: {{ currentItem.volume }}%
    </span>
  </div>
</template>

<script setup lang="ts">
interface MediaItem {
  name: string;
  type: string;
  size: number;
  volume: number;
  maxDuration: boolean;
  [key: string]: any;
}

defineProps<{
  queueLength: number;
  currentItem: MediaItem | null;
  timeRemaining: number;
}>();
</script>

<style scoped>
.queue-status {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

