<script setup lang="ts">
import { computed } from 'vue';
import MaterialVue from '@components/static/MaterialVue.vue';

interface Props {
  isEditing: boolean;
  loading: boolean;
  canSubmit: boolean;
  selectedMediaCount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  submit: [];
  reset: [];
  close: [];
}>();

const submitText = computed(() => {
  if (props.loading) return 'Guardando...';
  return props.isEditing ? 'Actualizar Draft' : 'Crear Draft';
});

const submitButtonText = computed(() => {
  if (props.selectedMediaCount === 0) return 'Selecciona al menos un elemento';
  if (props.loading) return 'Guardando...';
  return props.isEditing ? 'Actualizar Draft' : `Crear Draft (${props.selectedMediaCount} elementos)`;
});
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 pt-4">
    <button 
      type="submit"
      :disabled="!canSubmit || loading"
      class="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      @click="$emit('submit')"
    >
      <MaterialVue v-if="!loading">save</MaterialVue>
      <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span>{{ submitButtonText }}</span>
    </button>
    
    <div class="flex flex-col sm:flex-row gap-2 sm:w-auto">
      <button 
        type="button"
        @click="$emit('reset')"
        class="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <MaterialVue>refresh</MaterialVue>
        <span>Limpiar</span>
      </button>
      
      <button 
        type="button"
        @click="$emit('close')"
        class="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <MaterialVue>close</MaterialVue>
        <span>Cancelar</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Responsive form actions */
@media (max-width: 640px) {
  .flex-col {
    width: 100%;
  }
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
