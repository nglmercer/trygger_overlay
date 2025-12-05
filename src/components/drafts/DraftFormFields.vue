<script setup lang="ts">
import { DraftStatus } from '@utils/fetch/draftsapi.ts';

interface Props {
  formData: {
    content?: string;
    mediaIds?: string[];
    tags?: string[];
    status?: DraftStatus;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:content': [value: string];
  'update:tags': [value: string[]];
  'update:status': [value: DraftStatus];
}>();

const updateContent = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:content', target.value);
};

const addTag = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const tagValue = target.value.trim();
    if (tagValue && !props.formData.tags?.includes(tagValue)) {
      const newTags = [...(props.formData.tags || []), tagValue];
      emit('update:tags', newTags);
      target.value = '';
    }
  }
};

const removeTag = (tagToRemove: string) => {
  const newTags = props.formData.tags?.filter(tag => tag !== tagToRemove) || [];
  emit('update:tags', newTags);
};

const updateStatus = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:status', parseInt(target.value) as DraftStatus);
};
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Contenido del Draft
      </label>
      <input 
        :value="formData.content"
        @input="updateContent"
        type="text" 
        class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Ingresa el contenido de tu draft"
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Etiquetas
      </label>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2" v-if="formData.tags && formData.tags.length > 0">
          <span 
            v-for="tag in formData.tags" 
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {{ tag }}
            <button 
              @click="removeTag(tag)"
              class="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
            >
              ×
            </button>
          </span>
        </div>
        <input 
          type="text" 
          @keydown="addTag"
          class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Presiona Enter para agregar etiquetas"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Estado del Draft
      </label>
      <select 
        :value="formData.status"
        @change="updateStatus"
        class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option :value="DraftStatus.DRAFT">Borrador</option>
        <option :value="DraftStatus.IN_REVIEW">En Revisión</option>
        <option :value="DraftStatus.SCHEDULED">Programado</option>
        <option :value="DraftStatus.PUBLISHED">Publicado</option>
        <option :value="DraftStatus.ARCHIVED">Archivado</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
/* Responsive form fields */
@media (max-width: 640px) {
  input, textarea {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
