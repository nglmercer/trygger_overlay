<!-- MainContent.vue for Media Organization -->
<template>
  <div class="w-full m-2">
    <!-- Media Organization Interface -->
    <TabContent>
      <!-- Media Gallery and Organization -->
      <template #Images>
        <MediaElements mediaType="image" />
      </template>

      <template #Videos>
        <MediaElements mediaType="video" />
      </template>
      
      <template #Sounds>
        <MediaElements mediaType="audio" />
      </template>
    </TabContent>
  </div>
</template>

<script setup lang="ts">
import TabContent from '@components/content/TabContent.vue';
import MediaElements from '@components/content/MediaElements.vue';
</script>
