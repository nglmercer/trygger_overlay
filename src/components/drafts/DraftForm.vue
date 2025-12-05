<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { emitter } from '@utils/Emitter';
import { MediaEvents } from 'src/config/events';

// Estado para el formulario del draft
const draftForm = reactive({
  title: '',
  description: '',
  duration: 30,
  priority: 'medium'
});

// Estado para el elemento multimedia seleccionado
const selectedMediaItem = ref<any>(null);

// Función para abrir el selector de elementos (emite evento que puede ser capturado por otros componentes)
function openSelectElements() {
  console.log("Abriendo selector de elementos multimedia");
  emitter.emit("openSelectElements", {
    source: 'draft-form',
    timestamp: new Date().toISOString()
  });
}

// Función para manejar la selección de medios
const handleMediaSelection = (mediaData: any) => {
  console.log('Draft Form: Recibido elemento seleccionado:', mediaData);
  selectedMediaItem.value = mediaData;
  
  emitter.emit('show-notification', {
    type: 'success',
    message: `Elemento "${mediaData.name}" agregado al draft.`,
  });
};

// Función para limpiar la selección
const clearSelection = () => {
  selectedMediaItem.value = null;
  emitter.emit('show-notification', {
    type: 'info',
    message: 'Selección de elemento multimedia eliminada.',
  });
};

// Función para enviar el formulario
const submitDraft = () => {
  if (!selectedMediaItem.value || !draftForm.title) {
    emitter.emit('show-notification', {
      type: 'error',
      message: 'Por favor completa todos los campos requeridos.',
    });
    return;
  }

  const draftData = {
    ...draftForm,
    mediaElement: selectedMediaItem.value,
    createdAt: new Date().toISOString()
  };

  console.log('Enviando draft:', draftData);
  
  // Aquí puedes hacer la llamada a la API para guardar el draft
  // await draftsApi.createDraft(draftData);
  
  emitter.emit('show-notification', {
    type: 'success',
    message: `Draft "${draftForm.title}" creado exitosamente.`,
  });

  // Resetear el formulario después de enviar
  resetForm();
};

// Función para resetear el formulario
const resetForm = () => {
  draftForm.title = '';
  draftForm.description = '';
  draftForm.duration = 30;
  draftForm.priority = 'medium';
  selectedMediaItem.value = null;
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
  <div class="config-modal p-6 bg-slate-800 rounded-lg">
    <h2 class="text-2xl font-bold text-white mb-6">Crear Draft</h2>
    
    <form @submit.prevent="submitDraft" class="space-y-6">
      <!-- Información del draft -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Título del Draft
          </label>
          <input 
            v-model="draftForm.title"
            type="text" 
            class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ingresa un título para tu draft"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Descripción
          </label>
          <textarea 
            v-model="draftForm.description"
            rows="3"
            class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe el contenido de tu draft"
          ></textarea>
        </div>
      </div>

      <!-- Selección de Media -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-white mb-2">Elemento Multimedia</h3>
        
        <!-- Botón para seleccionar media -->
        <button 
          type="button" 
          @click="openSelectElements"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
          Seleccionar Elemento Multimedia
        </button>

        <!-- Mostrar elemento seleccionado -->
        <div v-if="selectedMediaItem" class="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
          <h4 class="text-sm font-semibold text-green-300 mb-2">Elemento Seleccionado:</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-400">ID:</span>
              <span class="text-white ml-2">{{ selectedMediaItem.id }}</span>
            </div>
            <div>
              <span class="text-gray-400">Nombre:</span>
              <span class="text-white ml-2">{{ selectedMediaItem.name }}</span>
            </div>
            <div>
              <span class="text-gray-400">Tipo:</span>
              <span class="text-white ml-2 capitalize">{{ selectedMediaItem.type }}</span>
            </div>
            <div>
              <span class="text-gray-400">URL:</span>
              <a v-if="selectedMediaItem.url" :href="selectedMediaItem.url" target="_blank" class="text-blue-400 ml-2 hover:underline">
                Ver archivo
              </a>
            </div>
          </div>
          <button 
            type="button"
            @click="clearSelection"
            class="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Eliminar Selección
          </button>
        </div>

        <!-- Mensaje cuando no hay selección -->
        <div v-else class="p-4 bg-gray-900/30 border border-gray-600/50 rounded-lg text-center">
          <p class="text-gray-400 text-sm">
            No hay elemento multimedia seleccionado. Haz clic en el botón de arriba para seleccionar uno.
          </p>
        </div>
      </div>

      <!-- Configuración adicional -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-white mb-2">Configuración Adicional</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Duración (segundos)
            </label>
            <input 
              v-model.number="draftForm.duration"
              type="number" 
              min="1"
              class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="30"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Prioridad
            </label>
            <select 
              v-model="draftForm.priority"
              class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3 pt-4">
        <button 
          type="submit"
          :disabled="!selectedMediaItem || !draftForm.title"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Crear Draft
        </button>
        <button 
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Limpiar Formulario
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.config-modal {
  min-width: 600px;
  max-width: 800px;
}
</style>
