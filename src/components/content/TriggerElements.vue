<template>
      <EmptyComponent 
        v-if="triggerElements.length === 0"
        :config="emptyStateConfig[emptyConfigKey]"
        @action-click="handleOpenForm(props.type)"
      />
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[minmax(0,_auto)]"
      >
        <dataElement
          v-for="element in triggerElements"
          :key="element.id"
          :element="element"
          :mediaItem="element"
          :icon="emptyStateConfig[emptyConfigKey].icon"
          class="aspect-[3/2] w-full"
          @edit="handleEdit"
          @toggle="handleToggle"
        />
      </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import EmptyComponent from './EmptyComponent.vue';
import { triggerApi,transformTriggersToArray, type BaseTriggerInput,type MediaType } from '@utils/fetch/fetchapi';
import { emptyStateConfig, type EmptyStateConfig, type TabName, typeToTabNameMap } from 'src/config/tabs';
import { emitter } from '@utils/Emitter';
import { TriggerEvents } from 'src/config/events';
import dataElement from '@components/Trigger/dataElement.vue';

const triggerElements   = ref<BaseTriggerInput[]>([])

const props = defineProps<{
  type: MediaType | string;
}>();

const emptyConfigKey = computed<TabName>(() => {
  const mappedKey = typeToTabNameMap[props.type];
  if (mappedKey) {
    return mappedKey;
  }
  console.warn(`Unknown type prop received: ${props.type}. Defaulting to 'Images'.`);
  return 'Images';
});
const handleOpenForm = (type:string) => {
  if (emptyConfigKey.value === 'Groups') return
  console.log('Action clicked!', type);
  emitter.emit(TriggerEvents.FormType, type)
};
const handleEdit = (element: BaseTriggerInput) => {
  console.log('Edit clicked!', element);
  emitter.emit(TriggerEvents.FormType, props.type);
  emitter.emit(TriggerEvents.setForm, element);
};
const handleToggle =async (element: BaseTriggerInput, enabled: boolean) => {
  if (!element.id)return;
  const changeState = await triggerApi.toggle(element.id)
  console.log('Toggle clicked!', element, enabled,changeState);
  Elements()
};
const Elements = async ()=>{
  const triggers = await triggerApi.list()
  triggerElements.value = transformTriggersToArray(triggers, props.type)
    .filter(item => item?.item?.type?.includes(props.type))
}
emitter.on(TriggerEvents.Submit,()=>Elements())
emitter.on(TriggerEvents.Add,()=>{
  handleOpenForm(props.type)
})
Elements()
</script>