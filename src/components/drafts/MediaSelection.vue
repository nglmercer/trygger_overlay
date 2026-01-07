<script setup lang="ts">
import MaterialVue from '@components/static/MaterialVue.vue';
import MediaItemCard from './MediaItemCard.vue';

interface MediaItem {
  id: string | number;
  name: string;
  type: string;
  url?: string | null;
}

interface Props {
  selectedMediaItems: MediaItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'open-selector': [];
  'remove-item': [index: number];
  'clear-all': [];
}>();

const openSelector = () => {
  emit('open-selector');
};

const removeItem = (index: number) => {
  emit('remove-item', index);
};

const clearAll = () => {
  emit('clear-all');
};
</script>

<template>
  <div class="space-y-4">
    
    <!-- Botón de selección -->
    <div class="flex flex-col sm:flex-row gap-2">
      <button 
        type="button" 
        @click="openSelector"
        class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <MaterialVue>add</MaterialVue>
        <span>Seleccionar Elemento Multimedia</span>
      </button>
    </div>

    <!-- Mostrar elementos seleccionados -->
    <div v-if="selectedMediaItems.length > 0" class="rounded-lg">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h4 class="text-sm font-semibold text-green-300">
          Elementos Seleccionados ({{ selectedMediaItems.length }}):
        </h4>
        <button 
          type="button"
          @click="clearAll"
          class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <MaterialVue>clear_all</MaterialVue>
          Eliminar todos
        </button>
      </div>
      
      <!-- Grid de elementos seleccionados -->
      <div class="grid gap-3 max-h-96 overflow-auto pr-2">
        <MediaItemCard 
          v-for="(item, index) in selectedMediaItems" 
          :key="item.id" 
          :item="item"
          :index="index"
          @remove="removeItem"
        />
      </div>
    </div>

    <!-- Mensaje cuando no hay selección -->
    <div v-else class="p-6 bg-gray-900/30 border border-gray-600/50 rounded-lg text-center">
      <div class="flex flex-col items-center gap-3">
        <MaterialVue class="text-4xl text-gray-500">perm_media</MaterialVue>
        <p class="text-gray-400 text-sm sm:text-base">
          No hay elementos multimedia seleccionados.
        </p>
        <p class="text-gray-500 text-xs sm:text-sm">
          Haz clic en el botón de arriba para seleccionar uno o más elementos.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsive media selection */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}

/* Custom scrollbar for media list */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
