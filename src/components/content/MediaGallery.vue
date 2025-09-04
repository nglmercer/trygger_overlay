<!-- components/MediaGallery.vue -->
<template>
    <!-- El contenedor principal ya no necesita gestionar el padding/fondo, eso lo hará el padre -->
    <div class="w-full">
        <!-- Estados de Carga, Error y Vacío -->
        <div v-if="isLoading" class="text-center py-10">
            <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">Cargando Media ({{ props.mediaType }})...</p>
        </div>
        <div v-else-if="error"
            class="text-center py-10 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
            <p class="font-bold">Ocurrió un error:</p>
            <p>{{ error }}</p>
        </div>
        <div v-else-if="mediaItems.length === 0" class="text-center py-10">
            <p class="mt-2 text-xl text-gray-500 dark:text-gray-400">No se encontraron medios de tipo '{{ props.mediaType }}'.</p>
        </div>

        <!-- Cuadrícula de Medios -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="item in mediaItems" :key="item.id"
                class="group relative bg-slate-800 rounded-lg shadow-md overflow-hidden">

                <!-- Área de vista previa dinámica por tipo -->
                <div class="aspect-w-1 aspect-h-1 aspect-16:9 aspect-3/2 w-full flex items-center justify-center bg-black/20 overflow-hidden">
                    <!-- Vista previa para imágenes con URL base personalizada -->
                    <PreviewSrc v-if="(item.type === 'image' || item.type === 'audio' || item.type === 'video') && item.url" :item="item" :getFullImageUrl="getFullImageUrl" 
                        />
                    <MaterialVue v-else class="text-5xl text-slate-500">help_outline</MaterialVue>
                </div>

                <!-- Sección de Información y Acciones -->
                <div class="p-3 flex items-center justify-between bg-slate-800">
                    <p class="text-sm font-medium text-slate-200 truncate pr-2" :title="item.name || 'Sin Nombre'">
                        {{ item.name || 'Sin Nombre' }}
                    </p>
                    <div class="flex items-center space-x-2 flex-shrink-0">
                        <button @click="DeleteMedia(item.id)" class="text-slate-400 hover:text-red-500 transition-colors">
                            <MaterialVue>delete</MaterialVue>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { mediaApi } from '@utils/fetch/fetchapi';
import { emitter } from '@utils/Emitter';
import type { MediaItem, MediaType } from '@utils/fetch/fetchapi';
import MaterialVue from '@components/static/MaterialVue.vue';
import PreviewSrc from './Preview-src.vue';
// --- PROPS: Entradas del componente, controladas por el padre ---
interface Props {
  mediaType: MediaType;
  imageBaseUrl?: string;
}
const props = withDefaults(defineProps<Props>(), {
  imageBaseUrl: 'http://localhost:3000', // Por defecto, no hay base. El padre debería proveerla.
});

// --- EMITS: Eventos que el componente envía al padre ---
const emit = defineEmits<{
  (e: 'loaded', items: MediaItem[]): void;
  (e: 'error', message: string): void;
}>();

// --- ESTADO INTERNO ---
const mediaItems = ref<MediaItem[]>([]);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const selectedItem = ref<MediaItem | null>(null);
// --- LÓGICA ---
const getFullImageUrl = (relativePath: string): string => {
  if (!props.imageBaseUrl || relativePath.startsWith('http')) {
    return relativePath;
  }
  // Elimina slashes duplicados entre la base y la ruta
  return `${props.imageBaseUrl.replace(/\/$/, '')}/${relativePath.replace(/^\//, '')}`;
};

const transformMediaObjectToArray = (mediaObject: Record<string, any>, type: MediaType): MediaItem[] => {
    if (!mediaObject || typeof mediaObject !== 'object') return [];
    // Demo data generator
    return Object.keys(mediaObject).map((key, index) => ({
        id: key,
        name: `${type}_demo_${index + 1}`,
        type: type, // Asigna el tipo actual
        url: `/200/300?random=${key}`, // URL relativa de ejemplo
        ...mediaObject[key],
    }));
};

const fetchMedia = async (type: MediaType) => {
  isLoading.value = true;
  error.value = null;
  mediaItems.value = [];

  try {
    // AHORA USAMOS LA LLAMADA REAL A LA API
    const itemsFromApi = await mediaApi.getByType(type);
    
    // Suponiendo que la API devuelve un objeto, lo transformamos. Si ya devuelve un array, puedes usarlo directamente.
    // Usaré tu función de transformación como ejemplo.
    const transformedItems = transformMediaObjectToArray(itemsFromApi, type);
    
    mediaItems.value = transformedItems;
    // **EMITIMOS** el evento 'loaded' para notificar al padre
    emit('loaded', transformedItems);
  } catch (err: any) {
    const errorMessage = err.message || `No se pudo cargar la librería de medios de tipo ${type}.`;
    error.value = errorMessage;
    // **EMITIMOS** el evento 'error'
    emit('error', errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const DeleteMedia = async (id: string) => {
  console.log('DeleteMedia:', id);
  const itemName = mediaItems.value.find(item => item.id === id)?.name;
  try {
    await mediaApi.remove(id);
    mediaItems.value = mediaItems.value.filter(item => item.id !== id);
        emitter.emit('show-notification', {
          type: 'success',
          message: `Archivo ${itemName} eliminado con éxito.`,
        });
  } catch (err: any) {
    console.error(`Fallo al eliminar el elemento ${id}:`, err);
    emitter.emit('show-notification', {
      type: 'error',
      message: `Error al eliminar el archivo ${itemName}.`,
    });
  }
};

// --- REACTIVIDAD ---
// Observamos cambios en la prop `mediaType`. Cuando el padre la cambia,
// esta función se ejecuta para volver a cargar los datos.
// `immediate: true` hace que se ejecute también al montar el componente.
watch(() => props.mediaType, (newType) => {
    if (newType) {
        fetchMedia(newType);
    }
}, { immediate: true });
</script>