<template>
        <div v-if="!mediaItem" class="text-center py-10">
            <p class="mt-2 text-xl text-gray-500 dark:text-gray-400">No se encontró el medio.</p>
        </div>
        <div v-else>
            <!-- Área de la vista previa del video (la parte de arriba) -->
            <div class="w-full h-full flex items-center justify-center bg-black/20">
                <!-- Icono de cámara de video, más grande y centrado -->
                <MaterialVue class="text-5xl text-slate-500">{{ icon || type }}</MaterialVue>
                <!-- Nombre del item, trunca el texto si es muy largo -->
                <p class="text-sm font-medium text-slate-200 truncate pr-2" :title="mediaItem.name || 'Sin Nombre'">
                    {{ mediaItem.name || 'Sin Nombre' }}
                </p>
            </div>
            <div class="p-3 flex items-center justify-between bg-slate-800">
                <!-- Contenedor para el interruptor y el botón de editar -->
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <!-- Interruptor (Toggle Switch) -->
                    <button type="button"
                        @click="toggleSwitch"
                        :class="[
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                            switchEnabled ? 'bg-indigo-500' : 'bg-gray-200'
                        ]"
                        role="switch" 
                        :aria-checked="switchEnabled">
                        <!-- Círculo del interruptor -->
                        <span aria-hidden="true"
                            :class="[
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                switchEnabled ? 'translate-x-5' : 'translate-x-0'
                            ]">
                        </span>
                    </button>
                    <!-- Botón de Editar -->
                    <button @click="handleEdit"
                        class="text-slate-400 hover:text-white transition-colors">
                        <MaterialVue>edit</MaterialVue>
                    </button>
                </div>
            </div>
        </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MaterialVue from '@components/static/MaterialVue.vue';
import type { TriggerInput } from '@utils/fetch/fetchapi';

// Props que recibe el componente
const props = defineProps<{
    mediaItem?: TriggerInput | null;
    error?: string;
    icon?: string;
    type?: string;
}>();

// Define emit events with proper typing
const emit = defineEmits(['edit', 'toggle', 'load', 'refresh'] as const);

// Computed para el estado del switch
const switchEnabled = computed(() => props.mediaItem?.active ?? false);

// Manejadores de eventos
const handleEdit = () => {
    if(!props.mediaItem) return;
    emit('edit', props.mediaItem);
};

const toggleSwitch = () => {
    if(!props.mediaItem) return;
    const newState = !switchEnabled.value;
    emit('toggle', props.mediaItem, newState);
};

// Función para solicitar carga de datos
const requestLoad = () => {
    emit('load');
};

// Función para solicitar actualización de datos
const requestRefresh = () => {
    emit('refresh');
};

// Exponer funciones útiles para el componente padre
defineExpose({
    requestLoad,
    requestRefresh
});
</script>