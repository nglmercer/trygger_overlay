<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: 'Images' | 'Videos' | 'Sounds' | 'Upload';
}>();

const emit = defineEmits<{ (e: 'go-upload'): void }>();

const iconName = computed(() => {
  switch (props.type) {
    case 'Images': return 'image_search';
    case 'Videos': return 'video_search';
    case 'Sounds': return 'audio_file';
    case 'Upload': return 'cloud_upload';
    default: return '';
  }
});
</script>

<template>
    <div class="flex flex-col items-center justify-center h-full text-center text-white/70 py-16">
        <span class="material-symbols-outlined text-6xl mb-4 text-white/30">
            {{ iconName }}
        </span>
        <h2 class="text-2xl font-medium text-white/90 mb-2">No {{ props.type.toLowerCase() }} yet 😔</h2>
        <p class="mb-6">Upload your first file to get started.</p>
        <button @click="emit('go-upload')" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-md flex items-center transition-colors shadow-lg">
            <span class="material-symbols-outlined mr-2">upload</span>
            Upload
        </button>
    </div>
</template>