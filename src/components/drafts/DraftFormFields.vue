<script setup lang="ts">
interface DraftFormData {
  title: string;
  description: string;
  duration: number;
  priority: string;
}

interface Props {
  formData: DraftFormData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:title': [value: string];
  'update:description': [value: string];
  'update:duration': [value: number];
  'update:priority': [value: string];
}>();

const updateTitle = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:title', target.value);
};

const updateDescription = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:description', target.value);
};
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Título del Draft
      </label>
      <input 
        :value="formData.title"
        @input="updateTitle"
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
        :value="formData.description"
        @input="updateDescription"
        rows="3"
        class="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Describe el contenido de tu draft"
      ></textarea>
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
