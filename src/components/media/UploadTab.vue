<script setup lang="ts">
import { ref } from 'vue';
import { mediaApi } from 'src/utils/fetch/fetchapi';
import type { MediaType } from 'src/utils/fetch/fetchapi';
import { emitter } from '@utils/Emitter';
import { MediaEvents } from 'src/config/events';
const isUploading = ref(false);
const MAX_BYTES = 20 * 1024 * 1024;
const fileInput = ref<HTMLInputElement | null>(null);
const isSelectionMode = ref(false);
const selectedItemId = ref<string | null>(null);

const detectMediaType = (file: File): MediaType | null => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  if (['png', 'jpeg', 'jpg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'video';
  if (['mp3', 'mpeg', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) return 'audio';
  return null;
};

const handleFiles = async (fileList: FileList | File[]) => {
  const files = Array.from(fileList as any as File[]);
  if (!files.length) return;
  isUploading.value = true;
  try {
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        console.warn(`Skipped ${file.name}: exceeds 20MB`);
        continue;
      }
      const mediaType = detectMediaType(file);
      if (!mediaType) {
        console.warn(`Skipped ${file.name}: unsupported format`);
        continue;
      }
      try {
        const res = await mediaApi.uploadMedia(mediaType, file, { fileName: file.name, metadata: { size: file.size, type: file.type } });
        console.log('Uploaded:', res);
        emitter.emit('show-notification', {
          type: 'success',
          message: `Archivo ${file.name} subido con éxito.`,
        });
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        emitter.emit('show-notification', {
          type: 'error',
          message: `Error al subir ${file.name}.`,
        });
      }
    }
  } finally {
    isUploading.value = false;
  }
};

const onSelectClick = () => fileInput.value?.click();

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length) {
    await handleFiles(files);
  }
  if (input) input.value = '';
};

const onDrop = async (e: DragEvent) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    await handleFiles(files);
  }
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value;
  selectedItemId.value = null;
  emitter.emit('show-notification', {
    type: 'info',
    message: isSelectionMode.value ? 'Modo selección activado' : 'Modo selección desactivado',
  });
};

const handleSelection = async (fileList: FileList | File[]) => {
  const files = Array.from(fileList as any as File[]);
  if (!files.length) return;
  
  // Para modo selección, solo procesamos el primer archivo
  const file = files[0];
  const mediaType = detectMediaType(file);
  
  if (!mediaType) {
    emitter.emit('show-notification', {
      type: 'error',
      message: `Formato de archivo no soportado: ${file.name}`,
    });
    return;
  }
  
  try {
    const res = await mediaApi.uploadMedia(mediaType, file, { 
      fileName: file.name, 
      metadata: { size: file.size, type: file.type } 
    });
    
    // Emitir el evento con el ID del archivo seleccionado
    if (res && res.id) {
      selectedItemId.value = res.id;
      emitter.emit(MediaEvents.selectedMedia, {
        id: res.id,
        name: file.name,
        type: mediaType,
        url: res.url || ''
      });
      
      emitter.emit('show-notification', {
        type: 'success',
        message: `Archivo ${file.name} seleccionado para drafts.`,
      });
    }
  } catch (err) {
    console.error(`Failed to select ${file.name}:`, err);
    emitter.emit('show-notification', {
      type: 'error',
      message: `Error al seleccionar ${file.name}.`,
    });
  }
};

const onSelectForDraftClick = () => {
  if (isSelectionMode.value) {
    fileInput.value?.click();
  }
};

const onFileSelectionChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length && isSelectionMode.value) {
    await handleSelection(files);
  }
  if (input) input.value = '';
};

const onDropForSelection = async (e: DragEvent) => {
  if (!isSelectionMode.value) return;
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    await handleSelection(files);
  }
};
</script>

<template>
  <div 
    class="w-full max-w-3xl mx-auto rounded-md"
    @drop="isSelectionMode ? onDropForSelection($event) : onDrop($event)"
    @dragover="onDragOver"
    :class="{ 'ring-2 ring-blue-500': isSelectionMode }"
  >
    <div class="flex flex-col items-center text-center py-24">
      <button 
        type="button" 
        @click="isSelectionMode ? onSelectForDraftClick() : onSelectClick()"
        :disabled="isUploading"
        class="h-9 min-w-[64px] px-4 inline-flex items-center justify-center rounded font-medium tracking-wider uppercase cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        :class="isSelectionMode 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-[rgb(70,89,255)] text-white'"
      >
        <span v-if="isUploading">UPLOADING...</span>
        <span v-else-if="isSelectionMode" class="font-bold">Seleccionar para Draft...</span>
        <span v-else class="font-bold">Select file...</span>
      </button>
      <div class="pt-2 text-sm text-white/80">
        {{ isSelectionMode ? 'o arrastra un archivo para seleccionar' : 'or drag and drop' }}
      </div>
    </div>
    <div class="text-center px-3 pb-4">
      <small class="block text-[11.2px] text-white/70">Supported formats: png, jpeg, jpg, gif, mp3, mpeg, wav, ogg, webm and mp4</small>
      <small class="block text-[11.2px] text-white/70">Max file size: <b class="font-bold text-white">20MB</b></small>
      <small v-if="isSelectionMode" class="block text-[11.2px] text-blue-300 mt-2">
        <b class="font-bold">Modo selección:</b> Solo se procesará el primer archivo
      </small>
    </div>
    <input 
      ref="fileInput"
      type="file" 
      name="upload[]" 
      :multiple="!isSelectionMode"
      accept=".png,.jpeg,.jpg,.gif,.mp3,.mpeg,.wav,.ogg,.webm,.mp4" 
      class="hidden" 
      @change="isSelectionMode ? onFileSelectionChange($event) : onFileChange($event)"
    /> 
  </div>
</template>
