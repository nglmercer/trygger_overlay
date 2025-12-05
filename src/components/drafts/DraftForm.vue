<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { emitter } from '@utils/Emitter';
import { MediaEvents } from 'src/config/events';
import DraftsApi, { type Draft, type CreateDraftDto, type UpdateDraftDto } from '@utils/fetch/draftsapi.ts';
import MaterialVue from '@components/static/MaterialVue.vue';
import apiConfig from 'src/config/apiConfig';
// Props
interface Props {
  editingDraft?: Draft | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
}>();

// Estado para el formulario del draft
const draftForm = reactive({
  title: '',
  description: '',
  duration: 30,
  priority: 'medium'
});

// Estado para los elementos multimedia seleccionados (array)
const selectedMediaItems = ref<any[]>([]);
const loading = ref(false);

// Instancia de la API
const draftsApi = new DraftsApi(apiConfig);

// Modo de edición
const isEditing = ref(false);
// Función para resetear el formulario
const resetForm = () => {
  draftForm.title = '';
  draftForm.description = '';
  draftForm.duration = 30;
  draftForm.priority = 'medium';
  selectedMediaItems.value = [];
};

// Watch para cambios en editingDraft
watch(() => props.editingDraft, (newDraft) => {
  if (newDraft) {
    // Modo edición: cargar datos del draft
    isEditing.value = true;
    draftForm.title = newDraft.content || '';
    draftForm.description = ''; // El API actual no tiene description
    draftForm.duration = 30; // Valor por defecto
    draftForm.priority = 'medium'; // Valor por defecto
    
    // Cargar medios si existen los IDs
    if (newDraft.mediaIds && newDraft.mediaIds.length > 0) {
      // Por ahora, creamos objetos básicos con los IDs
      // En una implementación completa, aquí se cargarían los detalles de los medios
      selectedMediaItems.value = newDraft.mediaIds.map(id => ({
        id,
        name: `Elemento ${id}`,
        type: 'unknown',
        url: null
      }));
    } else {
      selectedMediaItems.value = [];
    }
  } else {
    // Modo creación: resetear formulario
    isEditing.value = false;
    resetForm();
  }
}, { immediate: true });

// Función para abrir el selector de elementos (emite evento que puede ser capturado por otros componentes)
function uploadModal() {
  console.log("Abriendo selector de elementos multimedia");
  // Mostrar botones de selección en las galerías
  emitter.emit('show-selection-buttons', {});
  
  emitter.emit("uploadModal", {
    source: 'draft-form',
    timestamp: new Date().toISOString()
  });
}

// Función para manejar la selección de medios (array)
const handleMediaSelection = (mediaData: any) => {
  console.log('Draft Form: Recibido elemento seleccionado:', mediaData);

  // Verificar si el elemento ya está en el array para evitar duplicados
  const existingIndex = selectedMediaItems.value.findIndex(item => item.id === mediaData.id);
  if (existingIndex === -1) {
    selectedMediaItems.value.push(mediaData);
    emitter.emit('show-notification', {
      type: 'success',
      message: `Elemento "${mediaData.name}" agregado al draft.`,
    });
  } else {
    emitter.emit('show-notification', {
      type: 'info',
      message: `Elemento "${mediaData.name}" ya está en el draft.`,
    });
  }
};

// Función para eliminar un elemento específico del array
const removeMediaItem = (index: number) => {
  const removedItem = selectedMediaItems.value[index];
  selectedMediaItems.value.splice(index, 1);
  emitter.emit('show-notification', {
    type: 'info',
    message: `Elemento "${removedItem.name}" eliminado del draft.`,
  });
};

// Función para limpiar toda la selección
const clearSelection = () => {
  selectedMediaItems.value = [];
  emitter.emit('show-notification', {
    type: 'info',
    message: 'Todos los elementos multimedia eliminados del draft.',
  });
};

// Función para enviar el formulario
const submitDraft = async () => {
  if (selectedMediaItems.value.length === 0 || !draftForm.title) {
    emitter.emit('show-notification', {
      type: 'error',
      message: 'Por favor completa todos los campos requeridos y selecciona al menos un elemento multimedia.',
    });
    return;
  }

  loading.value = true;

  try {
    const mediaIds = selectedMediaItems.value.map(item => item.id);
    const draftData = {
      content: draftForm.title,
      mediaIds: mediaIds
    };

    if (isEditing.value && props.editingDraft) {
      // Modo edición
      await draftsApi.updateDraft(props.editingDraft.id, draftData);
      emitter.emit('show-notification', {
        type: 'success',
        message: `Draft "${draftForm.title}" actualizado exitosamente.`,
      });
    } else {
      // Modo creación
      await draftsApi.createDraft(draftData);
      emitter.emit('show-notification', {
        type: 'success',
        message: `Draft "${draftForm.title}" con ${selectedMediaItems.value.length} elementos creado exitosamente.`,
      });
    }

    // Cerrar el formulario después de enviar
    emit('close');
  } catch (error) {
    console.error('Error al guardar draft:', error);
    emitter.emit('show-notification', {
      type: 'error',
      message: `Error al ${isEditing.value ? 'actualizar' : 'crear'} el draft.`,
    });
  } finally {
    loading.value = false;
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
  <div class="config-modal p-6 bg-slate-800 rounded-lg">
    <h2 class="text-2xl font-bold text-white mb-6">
      {{ isEditing ? 'Editar Draft' : 'Crear Draft' }}
    </h2>
    
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
        
        <!-- Botones de selección -->
        <div class="flex gap-2">
          <button 
            type="button" 
            @click="uploadModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <MaterialVue>add</MaterialVue>
            Seleccionar Elemento Multimedia
          </button>
          
        </div>

        <!-- Mostrar elementos seleccionados (array) -->
        <div v-if="selectedMediaItems.length > 0" class="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
          <h4 class="text-sm font-semibold text-green-300 mb-2">Elementos Seleccionados ({{ selectedMediaItems.length }}):</h4>
          
          <!-- Lista de elementos seleccionados -->
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="(item, index) in selectedMediaItems" :key="item.id" 
                 class="p-2 bg-slate-700/50 rounded border border-slate-600">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-400">ID:</span>
                  <span class="text-white ml-2">{{ item.id }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Nombre:</span>
                  <span class="text-white ml-2">{{ item.name }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Tipo:</span>
                  <span class="text-white ml-2 capitalize">{{ item.type }}</span>
                </div>
                <div>
                  <span class="text-gray-400">URL:</span>
                  <a v-if="item.url" :href="item.url" target="_blank" class="text-blue-400 ml-2 hover:underline">
                    Ver archivo
                  </a>
                </div>
              </div>
              <!-- Botón para eliminar elemento individual -->
              <button 
                type="button"
                @click="removeMediaItem(index)"
                class="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <MaterialVue>delete</MaterialVue>
                Eliminar este elemento
              </button>
            </div>
          </div>
          
          <!-- Botón para limpiar toda la selección -->
          <button 
            type="button"
            @click="clearSelection"
            class="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <MaterialVue>clear_all</MaterialVue>
            Eliminar todos los elementos
          </button>
        </div>

        <!-- Mensaje cuando no hay selección -->
        <div v-else class="p-4 bg-gray-900/30 border border-gray-600/50 rounded-lg text-center">
          <p class="text-gray-400 text-sm">
            No hay elementos multimedia seleccionados. Haz clic en el botón de arriba para seleccionar uno o más elementos.
          </p>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3 pt-4">
        <button 
          type="submit"
          :disabled="selectedMediaItems.length === 0 || !draftForm.title || loading"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <MaterialVue v-if="!loading">save</MaterialVue>
          <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar Draft' : 'Crear Draft') }}
        </button>
        <button 
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <MaterialVue>refresh</MaterialVue>
          Limpiar Formulario
        </button>
        <button 
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <MaterialVue>close</MaterialVue>
          Cancelar
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
