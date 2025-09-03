<template>
    <!-- Fondo principal: Gris claro en modo claro, gris muy oscuro en modo oscuro -->
    <div class="min-h-screen bg-gray-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
            <!-- Estados de Carga, Error y Vacío (sin cambios) -->
            <div v-if="isLoading" class="text-center py-10">
                <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">Cargando Media...</p>
            </div>
            <div v-else-if="error"
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
                <div v-for="item in mediaItems" :key="item.id"
                    class="group relative bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <!-- Área de la vista previa del video (la parte de arriba) -->
                    <div class="aspect-w-1 aspect-h-1 w-full flex items-center justify-center bg-black/20">
                        <!-- Icono de cámara de video, más grande y centrado -->
                        <MaterialVue class="text-5xl text-slate-500">videocam</MaterialVue>
                    </div>

                    <!-- Nueva sección de Información y Acciones (la parte de abajo) -->
                    <div class="p-3 flex items-center justify-between bg-slate-800">
                        <!-- Nombre del item, trunca el texto si es muy largo -->
                        <p class="text-sm font-medium text-slate-200 truncate pr-2" :title="item.name || 'Sin Nombre'">
                            {{ item.name || 'Sin Nombre' }}
                        </p>

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
                            <button @click="editMedia(item.id)"
                                class="text-slate-400 hover:text-white transition-colors">
                                <MaterialVue>edit</MaterialVue>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// Ajusta la ruta de importación a donde guardaste tu archivo API
import { mediaApi } from '@utils/fetch/fetchapi';
import type { MediaItem } from '@utils/fetch/fetchapi';
import MaterialVue from '@components/static/MaterialVue.vue';

// Estado Reactivo
const mediaItems = ref<MediaItem[]>([]);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

// Función para transformar la respuesta del API de objeto a array
const transformMediaObjectToArray = (mediaObject: Record<string, any>): MediaItem[] => {
    if (Array.isArray(mediaObject)) {
        return mediaObject
    }
    if (!mediaObject || typeof mediaObject !== 'object') {
        return [];
    }
    // Añadimos datos de ejemplo para que coincida con la imagen de muestra
    const sampleNames = ["tu", "ratabailandocumbia", "ranariendo", "quericakola", "quemeimporta", "queeeee", "papudespierta", "padredomingome1234"];
    return Object.keys(mediaObject).map((key, index) => ({
        id: key,
        // Usamos nombres de ejemplo para la demo
        name: sampleNames[index % sampleNames.length],
        type: 'video', // Forzamos el tipo a video para la demo
        ...mediaObject[key]
    }));
};

// Obtener todos los medios del API
const fetchMedia = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        // Para esta demo, creamos datos falsos que coincidan con la imagen
        const fakeItems = {
            '1': {}, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {}, '8': {}
        };
        mediaItems.value = transformMediaObjectToArray(fakeItems);
        const items = await mediaApi.list();
        mediaItems.value = transformMediaObjectToArray(items);
    } catch (err: any) {
        console.error("Fallo al obtener medios:", err);
        error.value = err.message || "No se pudo cargar la librería de medios.";
    } finally {
        isLoading.value = false;
    }
};


// Manejar la eliminación de un medio
const deleteMedia = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        return;
    }
    try {
        await mediaApi.remove(id);
        mediaItems.value = mediaItems.value.filter(item => item.id !== id);
    } catch (err: any) {
        console.error(`Fallo al eliminar el elemento ${id}:`, err);
        alert(`Error: ${err.message || 'No se pudo eliminar el elemento.'}`);
    }
};

// Placeholder para editar un medio
const editMedia = (id: string) => {
    console.log('Editando elemento con ID:', id);
    alert(`La funcionalidad de edición para el elemento ${id} aún no está implementada.`);
};

// --- Hook de Ciclo de Vida ---
onMounted(() => {
    fetchMedia();
});
</script>