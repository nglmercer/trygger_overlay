<!-- MainContent.vue for Media Organization -->
<template>
  <div class="w-full m-2">
    <!-- Media Organization Interface -->
    <TabContent>
      <!-- Media Gallery and Organization -->
      <template #Images>
        <MediaGallery mediaType="image" />
      </template>

      <template #Videos>
        <MediaGallery mediaType="video" />
      </template>
      
      <template #Sounds>
        <MediaGallery mediaType="audio" />
      </template>
      
      <template #drafts>
        <DraftsList />
      </template>
    </TabContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { emitter } from '@utils/Emitter';
import TabContent from '@components/content/TabContent.vue';
import MediaGallery from './content/MediaGallery.vue';
import DraftsList from './drafts/DraftsList.vue';

// Component-level logic for MainContent
const isOpen = ref(false);

// Function to trigger open select elements event
const openSelectElements = () => {
  emitter.emit('open-select-elements', {
    isOpen: true,
    timestamp: Date.now()
  });
  isOpen.value = true;
};

// Cleanup function
const cleanup = () => {
  isOpen.value = false;
};

// Setup and cleanup
onMounted(() => {
  emitter.on('close-elements', cleanup);
});

onUnmounted(() => {
  emitter.off('close-elements', cleanup);
});

// Expose the function to parent components
defineExpose({
  openSelectElements
});
</script>
