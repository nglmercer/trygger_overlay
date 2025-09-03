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
        <div>
          <h2 class="text-2xl font-semibold text-cyan-400 mb-2">Galería de Imágenes</h2>
          <p>Este contenido se muestra cuando la pestaña 'Images' está activa.</p>
        </div>
      </template>

      <template #Videos>
        <div>
          <h2 class="text-2xl font-semibold text-emerald-400 mb-2">Videoteca</h2>
          <p>Este contenido se muestra cuando la pestaña 'Videos' está activa.</p>
        </div>
      </template>
      
      <template #Sounds>
        <div>
          <h2 class="text-2xl font-semibold text-amber-400 mb-2">Librería de Sonidos</h2>
          <p>Este contenido se muestra cuando la pestaña 'Sounds' está activa.</p>
        </div>
      </template>

      <!-- Puedes omitir los slots para las pestañas que no tienen contenido aún -->
      
    </TabContent>
  </div>
</template>

<script setup lang="ts">
// Importamos los componentes que vamos a usar en este "contenedor"
import TabContent from '@components/content/TabContent.vue';
</script>