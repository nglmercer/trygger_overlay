<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { emitter } from '@utils/Emitter';
import DraftsApi, { type Draft } from '@utils/fetch/draftsapi.ts';
import DraftItem from './DraftItem.vue';
import DraftForm from './DraftForm.vue';
import MaterialVue from '@components/static/MaterialVue.vue';
import apiConfig from 'src/config/apiConfig';

// Estado para los drafts
const drafts = ref<Draft[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Estado para el modal de creación/edición
const showCreateForm = ref(false);
const editingDraft = ref<Draft | null>(null);

// Instancia de la API
const draftsApi = new DraftsApi(apiConfig);

// Cargar todos los drafts
const loadDrafts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    drafts.value = await draftsApi.getAllDrafts();
    console.log('Drafts cargados:', drafts.value);
  } catch (err) {
    console.error('Error al cargar drafts:', err);
    error.value = 'No se pudieron cargar los drafts';
    emitter.emit('show-notification', {
      type: 'error',
      message: 'Error al cargar los drafts',
    });
  } finally {
    loading.value = false;
  }
};

// Manejar la creación de un nuevo draft
const handleCreateDraft = () => {
  showCreateForm.value = true;
  editingDraft.value = null;
};

// Manejar la edición de un draft existente
const handleEditDraft = (draft: Draft) => {
  editingDraft.value = draft;
  showCreateForm.value = true;
};

// Manejar la eliminación de un draft
const handleDeleteDraft = async (draft: Draft) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar el draft "${draft.content}"?`)) {
    return;
  }

  try {
    await draftsApi.deleteDraft(draft.id);
    emitter.emit('show-notification', {
      type: 'success',
      message: 'Draft eliminado exitosamente',
    });
    await loadDrafts(); // Recargar la lista
  } catch (err) {
    console.error('Error al eliminar draft:', err);
    emitter.emit('show-notification', {
      type: 'error',
      message: 'Error al eliminar el draft',
    });
  }
};

// Manejar el cierre del formulario
const handleFormClose = () => {
  showCreateForm.value = false;
  editingDraft.value = null;
  loadDrafts(); // Recargar la lista después de crear/editar
};

// Cargar los drafts al montar el componente
onMounted(() => {
  loadDrafts();
});
</script>

<template>
  <div class="p-6 bg-slate-800 rounded-lg">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">Drafts</h2>
      <button 
        @click="handleCreateDraft"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <MaterialVue>add</MaterialVue>
        Nuevo Draft
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <p class="text-gray-400 mt-2">Cargando drafts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="mb-4">
        <MaterialVue class="w-16 h-16 mx-auto text-red-500">error</MaterialVue>
      </div>
      <p class="text-red-400 mb-4">{{ error }}</p>
      <button 
        @click="loadDrafts"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="drafts.length === 0" class="text-center py-12">
      <div class="mb-4">
        <MaterialVue class="w-16 h-16 mx-auto text-gray-500">description</MaterialVue>
      </div>
      <p class="text-gray-400 mb-2">No hay drafts creados</p>
      <p class="text-sm text-gray-500 mb-4">
        Crea tu primer draft para empezar a organizar tu contenido multimedia
      </p>
      <button 
        @click="handleCreateDraft"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <MaterialVue>add</MaterialVue>
        Crear Primer Draft
      </button>
    </div>

    <!-- Drafts list -->
    <div v-else class="space-y-4">
      <div v-for="draft in drafts" :key="draft.id">
        <DraftItem 
          :draft="draft"
          @edit="handleEditDraft"
          @delete="handleDeleteDraft"
        />
      </div>
    </div>

    <!-- Modal para crear/editar drafts -->
    <dlg-cont :visible="showCreateForm">
      <div class="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">
            {{ editingDraft ? 'Editar Draft' : 'Crear Nuevo Draft' }}
          </h3>
          <button 
            @click="handleFormClose"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <MaterialVue>close</MaterialVue>
          </button>
        </div>
        
        <DraftForm 
          :editing-draft="editingDraft"
          @close="handleFormClose"
        />
      </div>
    </dlg-cont>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
