<script setup lang="ts">
interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: string;
}

const props = defineProps<{
  config: EmptyStateConfig;
}>();

const emit = defineEmits<{ 
  (e: 'action-click'): void 
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full text-center text-white/70 py-16">
    <span class="material-symbols-outlined text-6xl mb-4 text-white/30">
      {{ config.icon }}
    </span>
    <h2 class="text-2xl font-medium text-white/90 mb-2">{{ config.title }}</h2>
    <p class="mb-6">{{ config.description }}</p>
    <button 
      @click="emit('action-click')" 
      class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-md flex items-center transition-colors shadow-lg"
    >
      <span class="material-symbols-outlined mr-2">{{ config.buttonIcon }}</span>
      {{ config.buttonText }}
    </button>
  </div>
</template>