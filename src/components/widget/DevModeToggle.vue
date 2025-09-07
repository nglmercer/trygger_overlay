<!-- DevModeToggle.vue Component -->
<template>
  <div class="dev-mode-toggle">
    <button 
      @click="toggleDevMode" 
      class="toggle-btn"
      :class="{ active: modelValue }"
      title="Toggle Development Mode"
    >
      {{ modelValue ? '🔧' : '👁️' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const toggleDevMode = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<style scoped>
.dev-mode-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.toggle-btn.active {
  background: rgba(0, 123, 255, 0.9);
  color: white;
}
</style>