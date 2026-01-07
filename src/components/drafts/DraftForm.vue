<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { emitter } from '@utils/Emitter';
import { MediaEvents } from 'src/config/events';
import DraftsApi, { type Draft, type CreateDraftDto, type UpdateDraftDto, DraftStatus } from '@utils/fetch/draftsapi.ts';
import apiConfig from 'src/config/apiConfig';
import MultimediaResources from './MultimediaResources.vue';
import FormActions from './FormActions.vue';
import { MelserSelect as MeSelect ,BaseInput,MelserTextarea as MeTextarea } from 'melser-ui';

// Props
interface Props {
  editingDraft?: Draft | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
}>();

// Estado para el formulario del draft - compatible con CreateDraftDto
const draftForm = reactive<CreateDraftDto>({
  content: '',
  mediaIds: [],
  tags: [],
  status: DraftStatus.DRAFT
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
  draftForm.content = '';
  draftForm.mediaIds = [];
  draftForm.tags = [];
  draftForm.status = DraftStatus.DRAFT;
  selectedMediaItems.value = [];
};

// Watch para cambios en editingDraft
watch(() => props.editingDraft, (newDraft) => {
  if (newDraft) {
    // Modo edición: cargar datos del draft
    isEditing.value = true;
    draftForm.content = newDraft.content || '';
    draftForm.mediaIds = newDraft.mediaIds || [];
    draftForm.tags = []; // El API actual no tiene tags en el Draft interface
    draftForm.status = DraftStatus.DRAFT; // Valor por defecto
    
    // Cargar medios si existen los IDs
    if (newDraft.mediaIds && newDraft.mediaIds.length > 0) {
      // Por ahora, creamos objetos básicos con los IDs
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

// Función para abrir el selector de elementos
function uploadModal(options = {}) {
  console.log("Abriendo selector de elementos multimedia con opciones:", options);
  // Mostrar botones de selección en las galerías
  emitter.emit('show-selection-buttons', options);
  
  emitter.emit("uploadModal", {
    show: true,
    source: 'draft-form',
    timestamp: new Date().toISOString(),
    ...options
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

// Función para eliminar un elemento por ID
const removeMediaItemById = (id: string | number) => {
  const index = selectedMediaItems.value.findIndex(item => item.id === id);
  if (index !== -1) {
    const removedItem = selectedMediaItems.value[index];
    selectedMediaItems.value.splice(index, 1);
    emitter.emit('show-notification', {
      type: 'info',
      message: `Elemento "${removedItem.name}" eliminado del draft.`,
    });
  }
};

// Función para limpiar toda la selección
const clearSelection = () => {
  selectedMediaItems.value = [];
  emitter.emit('show-notification', {
    type: 'info',
    message: 'Todos lo elementos multimedia eliminados del draft.',
  });
};

// Función para enviar el formulario
const submitDraft = async () => {
  if (selectedMediaItems.value.length === 0 || !draftForm.content?.trim()) {
    emitter.emit('show-notification', {
      type: 'error',
      message: 'Por favor completa todos los campos requeridos y selecciona al menos un elemento multimedia.',
    });
    return;
  }

  loading.value = true;

  try {
    // Actualizar mediaIds en el formulario
    draftForm.mediaIds = selectedMediaItems.value.map(item => item.id);

    if (isEditing.value && props.editingDraft) {
      // Modo edición - usamos UpdateDraftDto para la API
      const updateData: UpdateDraftDto = {
        content: draftForm.content,
        mediaIds: draftForm.mediaIds
      };
      await draftsApi.updateDraft(props.editingDraft.id, updateData);
      emitter.emit('show-notification', {
        type: 'success',
        message: `Draft "${draftForm.content}" actualizado exitosamente.`,
      });
    } else {
      // Modo creación - usamos CreateDraftDto completo
      await draftsApi.createDraft(draftForm);
      emitter.emit('show-notification', {
        type: 'success',
        message: `Draft "${draftForm.content}" con ${selectedMediaItems.value.length} elementos creado exitosamente.`,
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
  return selectedMediaItems.value.length > 0 && draftForm.content?.trim() !== '';
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
    <div class="p-4 sm:p-6 bg-slate-800 rounded-lg shadow-xl">
      <!-- Form -->
      <form @submit.prevent="submitDraft" class="space-y-6">
        <section>
          <div class="">
            <base-input
            type="text"
            placeholder="Escribe tu draft..."
            name="title"
            ></base-input>
            <me-textarea
              label="Descripción detallada"
              placeholder="Describe tu producto o servicio..."
              auto-resize
              rows="3"
              maxlength="1000"
              show-counter
              name="description"
            >
            </me-textarea>
          </div>
        </section>
        <section>
          <!-- etiquetas y estado -->
            <me-select
              label="Estado"
              name="status"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </me-select>
          <MultimediaResources 
            :selected-items="selectedMediaItems"
            @open-selector="uploadModal"
            @remove-item="removeMediaItemById"
          />
        </section>
        <!-- acciones -->
        <section class="border-t border-slate-700 pt-6">


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

/* Responsive design */
@media (max-width: 640px) {
  h2 {
    font-size: 1.5rem;
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
</style>
