<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { emitter } from '@utils/Emitter';
import { MediaEvents } from 'src/config/events';

// Estado para almacenar el elemento seleccionado
const selectedMediaItem = ref<any>(null);

// Escuchar el evento de selección de medios
const handleMediaSelection = (mediaData: any) => {
  console.log('Draft Component: Recibido elemento seleccionado:', mediaData);
  selectedMediaItem.value = mediaData;
};

// Función para limpiar la selección
const clearSelection = () => {
  selectedMediaItem.value = null;
  emitter.emit('show-notification', {
    type: 'info',
    message: 'Selección limpiada en el componente Draft.',
  });
};

// Función para usar el elemento seleccionado
const useInDraft = () => {
  if (selectedMediaItem.value) {
    emitter.emit('show-notification', {
      type: 'success',
      message: `Elemento "${selectedMediaItem.value.name}" listo para usar en drafts.`,
    });
  }
};

// Montar y desmontar el listener del evento
onMounted(() => {
  emitter.on(MediaEvents.selectedMedia, handleMediaSelection);
});

onUnmounted(() => {
  emitter.off(MediaEvents.selectedMedia, handleMediaSelection);
});
</script>

<template>
  <div class="p-6 bg-slate-800 rounded-lg min-h-[400px]">
    <h2 class="text-xl font-bold text-white mb-4">Draft Component</h2>
    
    <!-- Área para mostrar el elemento seleccionado -->
    <div v-if="selectedMediaItem" class="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
      <h3 class="text-lg font-semibold text-green-300 mb-2">Elemento Seleccionado:</h3>
      <div class="space-y-2 text-sm">
        <p class="text-white"><strong>ID:</strong> {{ selectedMediaItem.id }}</p>
        <p class="text-white"><strong>Nombre:</strong> {{ selectedMediaItem.name }}</p>
        <p class="text-white"><strong>Tipo:</strong> {{ selectedMediaItem.type }}</p>
        <p v-if="selectedMediaItem.url" class="text-white"><strong>URL:</strong> {{ selectedMediaItem.url }}</p>
      </div>
      <div class="mt-3 flex gap-2">
        <button 
          @click="useInDraft"
          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          Usar en Draft
        </button>
        <button 
          @click="clearSelection"
          class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Limpiar Selección
        </button>
      </div>
    </div>
    
    <!-- Instrucciones cuando no hay selección -->
    <div v-else class="text-center py-12">
      <div class="mb-4">
        <svg class="w-16 h-16 mx-auto text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>
      </div>
      <p class="text-gray-400 mb-2">No hay elemento seleccionado</p>
      <p class="text-sm text-gray-500">
        Selecciona un archivo desde Upload con "Modo Selección" o desde las galerías usando el botón ✓
      </p>
    </div>
    
    <!-- Información de uso -->
    <div class="mt-8 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
      <h4 class="text-sm font-semibold text-blue-300 mb-2">¿Cómo usar?</h4>
      <ol class="text-xs text-blue-200 space-y-1 list-decimal list-inside">
        <li><strong>Opción 1:</strong> Ve a la pestaña "Upload" y activa "Modo Selección"</li>
        <li><strong>Opción 2:</strong> Ve a las pestañas "Images", "Videos" o "Sounds"</li>
        <li>Selecciona un archivo (arrastrando, haciendo clic o usando el botón ✓)</li>
        <li>El elemento aparecerá automáticamente aquí</li>
        <li>Usa el ID del elemento para integrarlo en tus drafts</li>
      </ol>
      <p class="text-xs text-blue-300 mt-2">
        <strong>Tip:</strong> Desde las galerías, pasa el mouse sobre un elemento y haz clic en el botón ✓ que aparece.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
