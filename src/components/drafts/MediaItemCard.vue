<script setup lang="ts">
import { ref } from 'vue';
import MaterialVue from '@components/static/MaterialVue.vue';

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

const isExpanded = ref(false);

const removeItem = () => {
  emit('remove', props.index);
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
    <!-- Header with collapse button -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <MaterialVue class="text-gray-400 text-lg">{{
          item.type === 'video' ? 'movie' : item.type === 'audio' ? 'audiotrack' : 'image'
        }}</MaterialVue>
        <span class="text-white font-medium truncate">{{ item.name }}</span>
      </div>
      
      <button 
        type="button"
        @click="toggleExpand"
        class="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
        :aria-label="isExpanded ? 'Colapsar' : 'Expandir'"
      >
        <MaterialVue class="transition-transform duration-200" :class="{ 'rotate-180': isExpanded }">
          expand_more
        </MaterialVue>
      </button>
    </div>

    <!-- Collapsible content -->
    <div 
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span class="text-gray-400 block text-xs mb-1">ID:</span>
          <span class="text-white font-mono text-xs">{{ item.id }}</span>
        </div>
        <div>
          <span class="text-gray-400 block text-xs mb-1">Nombre:</span>
          <span class="text-white break-words">{{ item.name }}</span>
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
        class="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
      >
        <MaterialVue>delete</MaterialVue>
        Eliminar elemento
      </button>
    </div>
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