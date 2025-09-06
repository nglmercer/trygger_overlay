<template>
      <EmptyComponent 
        v-if="triggerElements.length === 0"
        :config="emptyStateConfig[emptyConfigKey]"
        @action-click="() => {
        }"
      />
      <MediaGallery 
        :media-type="emptyStateConfig[emptyConfigKey]"
        :class="{ 'hidden': emptyConfigKey === 'Groups' || triggerElements.length === 0 }"
      />
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import EmptyComponent from './EmptyComponent.vue';
import type { MediaType } from '@utils/fetch/fetchapi';
import { emptyStateConfig, type EmptyStateConfig, type TabName, typeToTabNameMap } from 'src/config/tabs';


const triggerElements   = ref([])

const props = defineProps<{
  type: string;
}>();

const emptyConfigKey = computed<TabName>(() => {
  const mappedKey = typeToTabNameMap[props.type];
  if (mappedKey) {
    return mappedKey;
  }
  console.warn(`Unknown type prop received: ${props.type}. Defaulting to 'Images'.`);
  return 'Images';
});
</script>