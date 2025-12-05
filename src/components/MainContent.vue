<!-- MainContent.vue for Media Organization -->
<template>
  <div class="w-full m-2">
    <!-- Media Organization Interface -->
    <TabContent>
      <!-- Media Gallery and Organization -->
      <template #Images>
        <MediaGallery mediaType="image" :showSelectionButton="showSelectionButtons" />
      </template>

      <template #Videos>
        <MediaGallery mediaType="video" :showSelectionButton="showSelectionButtons" />
      </template>
      
      <template #Sounds>
        <MediaGallery mediaType="audio" :showSelectionButton="showSelectionButtons" />
      </template>
      
      <template #drafts>
        <dlg-cont ref="configModal" visible="true">
          <DraftForm />
        </dlg-cont>
      </template>
    </TabContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { emitter } from '@utils/Emitter';
import TabContent from '@components/content/TabContent.vue';
import MediaGallery from './content/MediaGallery.vue';
import DraftForm from './drafts/DraftForm.vue';

// Estado para controlar la visibilidad de los botones de selección
const showSelectionButtons = ref<boolean>(false);

// Manejar eventos para mostrar/ocultar botones de selección
const handleShowSelectionButtons = () => {
  showSelectionButtons.value = true;
};

const handleHideSelectionButtons = () => {
  showSelectionButtons.value = false;
};

onMounted(() => {
  // Escuchar eventos para controlar la visibilidad
  emitter.on('show-selection-buttons', handleShowSelectionButtons);
  emitter.on('hide-selection-buttons', handleHideSelectionButtons);
});

onUnmounted(() => {
  emitter.off('show-selection-buttons', handleShowSelectionButtons);
  emitter.off('hide-selection-buttons', handleHideSelectionButtons);
});
</script>
