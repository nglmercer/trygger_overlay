
<!-- MediaControls.vue Component -->
<template>
  <div class="queue-controls">
    <button @click="$emit('previous')" :disabled="queueLength <= 1" class="control-btn">
      ⏮️
    </button>
    <button @click="$emit('togglePlayPause')" class="control-btn">
      {{ isPlaying ? '⏸️' : '▶️' }}
    </button>
    <button @click="$emit('next')" :disabled="queueLength <= 1" class="control-btn">
      ⏭️
    </button>
    <button @click="$emit('clearQueue')" class="control-btn danger">
      🗑️
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  queueLength: number;
  isPlaying: boolean;
}>();

defineEmits<{
  previous: [];
  togglePlayPause: [];
  next: [];
  clearQueue: [];
}>();
</script>

<style scoped>
.queue-controls {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.control-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.danger:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .queue-controls {
    bottom: 40px;
  }
  
  .control-btn {
    font-size: 16px;
    padding: 6px;
  }
}
</style>