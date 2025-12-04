<template>
    <div class="max-w-7xl mx-auto min-h-screen bg-gray-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div v-if="error"
            class="text-center py-10 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
            <p class="font-bold">Ocurrió un error:</p>
            <p>{{ error }}</p>
        </div>
        <div v-else-if="mediaItems.length === 0" class="text-center py-10">
            <p class="mt-2 text-xl text-gray-500 dark:text-gray-400">No se encontraron medios.</p>
        </div>

        <!-- Cuadrícula de Medios -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <!-- Tarjeta de cada elemento de media -->
            <div v-for="item in mediaItems" :key="item.name"
                class="group relative bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <!-- Área de la vista previa del video (la parte de arriba) -->
                <div class="aspect-w-1 aspect-h-1 w-full flex items-center justify-center bg-black/20">
                    <!-- Icono de cámara de video, más grande y centrado -->
                    <MaterialVue class="text-5xl text-slate-500">videocam</MaterialVue>
                    <!-- Nombre del item, trunca el texto si es muy largo -->
                    <p class="text-sm font-medium text-slate-200 truncate pr-2" :title="item.name || 'Sin Nombre'">
                        {{ item.name || 'Sin Nombre' }}
                    </p>
                </div>

                <div class="p-3 flex items-center justify-between bg-slate-800">

                    <!-- Contenedor para el interruptor y el botón de editar -->
                    <div class="flex items-center space-x-2 flex-shrink-0">
                        <!-- Interruptor (Toggle Switch) -->
                        <button type="button"
                            class="bg-indigo-500 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                            role="switch" aria-checked="true">
                            <!-- Círculo del interruptor -->
                            <span aria-hidden="true"
                                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5">
                            </span>
                        </button>

                        <!-- Botón de Editar -->
                        <button @click="editMedia(item.name)"
                            class="text-slate-400 hover:text-white transition-colors">
                            <MaterialVue>edit</MaterialVue>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// Import only media API for media items
import { mediaApi, type MediaRecord } from '@utils/fetch/fetchapi';
import MaterialVue from '@components/static/MaterialVue.vue';

// Estado Reactivo
const mediaItems = ref<MediaRecord[]>([]);
const error = ref<string | null>(null);
const editMedia = (id: number | string) => {
    console.log('Editar media con ID:', id);
}

// Load media items on mount
const loadMediaItems = async () => {
    try {
        const allMedia = await mediaApi.getAllMedia();
        mediaItems.value = Object.values(allMedia);
    } catch (error) {
        console.error('Error loading media items:', error);
        // Handle gracefully when backend is not available
        console.warn("Backend server not available. No media items loaded.");
    }
};

// Load media items when component mounts
loadMediaItems();
</script>
