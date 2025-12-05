<script setup lang="ts">
interface MediaItem {
  id: string | number;
  name: string;
  type: string;
  url?: string | null;
}

interface Props {
  item: MediaItem;
  index: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  remove: [index: number];
}>();

const removeItem = () => {
  emit('remove', props.index);
};
</script>

<template>
  <div class="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div>
        <span class="text-gray-400 block text-xs mb-1">ID:</span>
        <span class="text-white font-mono text-xs">{{ item.id }}</span>
      </div>
      <div>
        <span class="text-gray-400 block text-xs mb-1">Nombre:</span>
        <span class="text-white truncate">{{ item.name }}</span>
      </div>
      <div>
        <span class="text-gray-400 block text-xs mb-1">Tipo:</span>
        <span class="text-white capitalize">{{ item.type }}</span>
      </div>
      <div>
        <span class="text-gray-400 block text-xs mb-1">URL:</span>
        <a 
          v-if="item.url" 
          :href="item.url" 
          target="_blank" 
          class="text-blue-400 hover:text-blue-300 hover:underline text-xs break-all"
        >
          Ver archivo
        </a>
        <span v-else class="text-gray-500 text-xs">No disponible</span>
      </div>
    </div>
    
    <button 
      type="button"
      @click="removeItem"
      class="mt-3 w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
    >
      <MaterialVue>delete</MaterialVue>
      Eliminar elemento
    </button>
  </div>
</template>

<style scoped>
/* Responsive media item card */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
