<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { emitter } from '@utils/Emitter';
import { MediaEvents } from 'src/config/events';
import DraftsApi, { type Draft, type CreateDraftDto, type UpdateDraftDto } from '@utils/fetch/draftsapi.ts';
import apiConfig from 'src/config/apiConfig';
import DraftFormFields from './DraftFormFields.vue';
import MediaSelection from './MediaSelection.vue';
import FormActions from './FormActions.vue';

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

// Computed properties para validación
const canSubmit = computed(() => {
  return selectedMediaItems.value.length > 0 && draftForm.title.trim() !== '';
});

// Montar y desmontar el listener del evento
onMounted(() => {
  emitter.on(MediaEvents.selectedMedia, handleMediaSelection);
});

onUnmounted(() => {
  emitter.off(MediaEvents.selectedMedia, handleMediaSelection);
});
</script>

<template>
  <div class="draft-form-container">
    <div class="config-modal p-4 sm:p-6 bg-slate-800 rounded-lg shadow-xl">
      <!-- Header -->
      <header class="mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-white">
          {{ isEditing ? 'Editar Draft' : 'Crear Draft' }}
        </h2>
        <p class="text-gray-400 text-sm mt-1">
          {{ isEditing ? 'Modifica los datos de tu draft existente' : 'Crea un nuevo draft con elementos multimedia' }}
        </p>
      </header>
      
      <!-- Form -->
      <form @submit.prevent="submitDraft" class="space-y-6">
        <!-- Sección de información del draft -->
        <section class="space-y-4">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
            <span class="w-1 h-5 bg-blue-500 rounded-full"></span>
            Información del Draft
          </h3>
          <DraftFormFields 
            :form-data="draftForm"
            @update:title="draftForm.title = $event"
            @update:description="draftForm.description = $event"
            @update:duration="draftForm.duration = $event"
            @update:priority="draftForm.priority = $event"
          />
        </section>

        <!-- Sección de selección de media -->
        <section class="space-y-4">
          <h3 class="text-lg font-semibold text-white flex items-center gap-2">
            <span class="w-1 h-5 bg-green-500 rounded-full"></span>
            Contenido Multimedia
          </h3>
          <MediaSelection 
            :selected-media-items="selectedMediaItems"
            @open-selector="uploadModal"
            @remove-item="removeMediaItem"
            @clear-all="clearSelection"
          />
        </section>

        <!-- Resumen y acciones -->
        <section class="border-t border-slate-700 pt-6">
          <!-- Resumen del draft -->
          <div class="mb-4 p-4 bg-slate-700/30 rounded-lg">
            <h4 class="text-sm font-semibold text-gray-300 mb-2">Resumen del Draft:</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-400">Título:</span>
                <span class="text-white ml-2">{{ draftForm.title || 'No especificado' }}</span>
              </div>
              <div>
                <span class="text-gray-400">Elementos:</span>
                <span class="text-white ml-2">{{ selectedMediaItems.length }} seleccionados</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <FormActions 
            :is-editing="isEditing"
            :loading="loading"
            :can-submit="canSubmit"
            :selected-media-count="selectedMediaItems.length"
            @submit="submitDraft"
            @reset="resetForm"
            @close="$emit('close')"
          />
        </section>
      </form>
    </div>
  </div>
</template>

<style scoped>
.draft-form-container {
  width: 100%;
  max-width: 100%;
}

.config-modal {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .config-modal {
    margin: 0 1rem;
    max-width: calc(100vw - 2rem);
  }
}

@media (max-width: 640px) {
  .config-modal {
    margin: 0;
    max-width: 100vw;
    min-height: 100vh;
    border-radius: 0;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .config-modal {
    min-width: 800px;
  }
}

/* Smooth transitions */
section {
  transition: all 0.3s ease;
}

/* Focus states */
form:focus-within {
  outline: none;
}

/* Custom scrollbar for modal */
.config-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.config-modal::-webkit-scrollbar {
  width: 8px;
}

.config-modal::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.config-modal::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.config-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
