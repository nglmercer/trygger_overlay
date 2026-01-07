<script setup lang="ts">
import { ref, computed } from 'vue';
import { emitter } from '@utils/Emitter';
import type { Draft } from '@utils/fetch/draftsapi.ts';
import MaterialVue from '@components/static/MaterialVue.vue';

// Props
interface Props {
  draft: Draft;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  edit: [draft: Draft];
  delete: [draft: Draft];
}>();

// Formatear fecha
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Estado expandido
const isExpanded = ref(false);

// Toggle expansión
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// Manejar edición
const handleEdit = () => {
  emit('edit', props.draft);
};

// Manejar eliminación
const handleDelete = () => {
  emit('delete', props.draft);
};

// Contenido truncado para preview
const truncatedContent = computed(() => {
  if (!props.draft.content) return 'Sin contenido';
  return props.draft.content.length > 100 
    ? props.draft.content.substring(0, 100) + '...' 
    : props.draft.content;
});
</script>

<template>
  <div class="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
    <!-- Header principal -->
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-white mb-2">
          {{ draft.content || 'Draft sin título' }}
        </h3>
        
        <!-- Metadatos -->
        <div class="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
          <div class="flex items-center gap-1">
            <MaterialVue class="text-gray-400">schedule</MaterialVue>
            <span>Creado: {{ formatDate(draft.createdAt) }}</span>
          </div>
          <div v-if="draft.updatedAt !== draft.createdAt" class="flex items-center gap-1">
            <MaterialVue class="text-gray-400">edit</MaterialVue>
            <span>Actualizado: {{ formatDate(draft.updatedAt) }}</span>
          </div>
          <div v-if="draft.mediaIds && draft.mediaIds.length > 0" class="flex items-center gap-1">
            <MaterialVue class="text-gray-400">perm_media</MaterialVue>
            <span>{{ draft.mediaIds.length }} elementos multimedia</span>
          </div>
        </div>

        <!-- Preview del contenido -->
        <div class="text-gray-300 text-sm mb-3">
          {{ truncatedContent }}
        </div>

        <!-- IDs de medios (cuando está expandido) -->
        <div v-if="isExpanded && draft.mediaIds && draft.mediaIds.length > 0" class="mb-3">
          <h4 class="text-sm font-medium text-gray-400 mb-2">Elementos multimedia:</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="mediaId in draft.mediaIds" 
              :key="mediaId"
              class="px-2 py-1 bg-slate-600 text-gray-300 text-xs rounded"
            >
              ID: {{ mediaId }}
            </span>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2 ml-4">
        <button 
          @click="toggleExpanded"
          class="p-2 text-gray-400 hover:text-white hover:bg-slate-500 rounded transition-colors"
          :title="isExpanded ? 'Contraer' : 'Expandir'"
        >
          <MaterialVue>{{ isExpanded ? 'expand_less' : 'expand_more' }}</MaterialVue>
        </button>
        <button 
          @click="handleEdit"
          class="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-500 rounded transition-colors"
          title="Editar"
        >
          <MaterialVue>edit</MaterialVue>
        </button>
        <button 
          @click="handleDelete"
          class="p-2 text-red-400 hover:text-red-300 hover:bg-slate-500 rounded transition-colors"
          title="Eliminar"
        >
          <MaterialVue>delete</MaterialVue>
        </button>
      </div>
    </div>

    <!-- Indicador de expansión -->
    <div v-if="draft.content && draft.content.length > 100" class="mt-2">
      <button 
        @click="toggleExpanded"
        class="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
      >
        <MaterialVue>{{ isExpanded ? 'expand_less' : 'expand_more' }}</MaterialVue>
        {{ isExpanded ? 'Mostrar menos' : 'Mostrar más' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
