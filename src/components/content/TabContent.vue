<!-- src/components/TabContent.vue -->
<template>
  <div class="p-4 bg-gray-700 text-white rounded-lg mt-4 transition-opacity duration-300" :key="activeTab">
    <!-- 
      Usamos <slot> para renderizar el contenido.
      El atributo `name` del slot debe coincidir con el `label` de la pestaña.
      Solo el slot cuyo `name` es igual a `activeTab` será visible.
    -->
    <slot :name="activeTab">
      <!-- Contenido por defecto si no se encuentra un slot con el nombre correcto -->
      <div class="text-center text-gray-400">
        <p>Selecciona una pestaña para ver el contenido.</p>
        <p v-if="activeTab">(Esperando contenido para: {{ activeTab }})</p>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// Asegúrate de que la ruta a tu emisor y configuración sea correcta
import { emitter } from '@utils/Emitter';
import { tabs } from 'src/config/tabs'; // Necesitamos esto para saber cuál es la pestaña inicial

// --- Estado Reactivo ---

// Buscamos la pestaña inicial definida en nuestro archivo de configuración.
const findInitialTab = () => {
  const initialActive = tabs.find(tab => tab.active);
  return initialActive ? initialActive.label : (tabs.length > 0 ? tabs[0].label : '');
};

// `activeTab` guardará el `label` de la pestaña actualmente seleccionada.
const activeTab = ref<string>(findInitialTab());

// --- Lógica del Emitter ---

// Guardaremos aquí la función para desuscribirnos y evitar fugas de memoria.
let unsubscribe: (() => void) | null = null;

// Cuando el componente se monta en el DOM...
onMounted(() => {
  // Nos suscribimos al evento 'tab:changed'.
  // La función callback se ejecutará cada vez que se emita el evento.
  unsubscribe = emitter.on('tab:changed', (newTabLabel: string) => {
    console.log(`TabContent: Recibido evento 'tab:changed' con valor -> ${newTabLabel}`);
    // Actualizamos nuestro estado reactivo, lo que hará que Vue re-renderice el slot correcto.
    activeTab.value = newTabLabel;
  });
});

// Cuando el componente se va a destruir...
onUnmounted(() => {
  // Es MUY IMPORTANTE desuscribirse para limpiar el listener.
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>