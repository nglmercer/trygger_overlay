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
        <dlg-cont ref="configModal" visible="true">
          <DraftForm />
        </dlg-cont>
      </template>
    </TabContent>
  </div>
</template>

<script setup lang="ts">
import TabContent from '@components/content/TabContent.vue';
import MediaGallery from './content/MediaGallery.vue';
import DraftForm from './drafts/DraftForm.vue';
</script>
