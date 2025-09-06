<!-- src/views/DashboardView.vue -->
<template>
  <div class="w-full m-2 ">
    <!-- 2. El componente que escucha los eventos y muestra el contenido -->
    <TabContent>
      <!-- 
        Aquí proporcionamos el contenido para cada pestaña usando la sintaxis de slots de Vue.
        La estructura es <template #NOMBRE_DEL_SLOT>...</template>
        El nombre del slot debe coincidir con el `label` de la pestaña.
      -->
      
      <template #Images>
        <TriggerElements type="image" />
      </template>

      <template #Videos>
        <TriggerElements type="video" />
      </template>
      
      <template #Sounds>
        <TriggerElements type="sonidos"/>
      </template>

      <template #OBS>
        <TriggerElements type="obs"/>
      </template>

      <template #Groups>
        <TriggerElements type="groups"/>
      </template>
      
      <!-- Puedes omitir los slots para las pestañas que no tienen contenido aún -->
      
    </TabContent>
  </div>
</template>

<script setup lang="ts">
// Importamos los componentes que vamos a usar en este "contenedor"
import TabContent from '@components/content/TabContent.vue';
import MediaElements from './content/MediaElements.vue';
import { mediaApi } from '@utils/fetch/fetchapi';
import TriggerElements from './content/TriggerElements.vue';
async function getMedia(type?:string) {
        const media = await mediaApi.list()
        console.log("media",media)
}
getMedia()
</script>