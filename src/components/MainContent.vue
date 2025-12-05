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
</script>
