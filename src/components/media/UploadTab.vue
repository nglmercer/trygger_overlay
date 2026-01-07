<script setup lang="ts">
import { ref, computed } from "vue";
import { mediaApi } from "src/utils/fetch/fetchapi";
import type { MediaType } from "src/utils/fetch/fetchapi";
import { emitter } from "@utils/Emitter";
import { MediaEvents } from "src/config/events";
import { mediaText, detectMediaType, maxFileSize, maxSizeText, mediaAccept, formatFileSize } from "./constants";

// FFmpeg analyzer - imported from separate module
import { 
  analyzeVideoFile, 
  type AudioTrack, 
  type SubtitleTrack,
  isFFmpegAvailable,
  unloadFFmpeg
} from "src/utils/ffmpeg/analyzer";

const isUploading = ref(false);
const MAX_BYTES = maxFileSize;
const fileInput = ref<HTMLInputElement | null>(null);
const isSelectionMode = ref(false);
const selectedItemId = ref<string | null>(null);

// FFmpeg state
const isFFmpegLoading = ref(false);
const pendingFiles = ref<PendingFile[]>([]);
const showTrackSelector = ref(false);
const ffmpegError = ref<string | null>(null);

// Track types interface
interface AudioTrackInfo {
  id: string;
  name: string;
  language: string;
  codec: string;
  selected: boolean;
}

interface SubtitleTrackInfo {
  id: string;
  name: string;
  language: string;
  selected: boolean;
}

interface PendingFile {
  id: string;
  file: File;
  type: MediaType;
  mediaType: "video" | "audio" | "image" | null;
  name: string;
  size: number;
  thumbnailUrl?: string;
  audioTracks: AudioTrackInfo[];
  subtitleTracks: SubtitleTrackInfo[];
  hasVideo: boolean;
  processingComplete: boolean;
  error?: string;
}

const pendingFileId = ref<string | null>(null);

// Process video files with FFmpeg
const processVideoFiles = async (files: File[], isSelection: boolean) => {
  isFFmpegLoading.value = true;
  ffmpegError.value = null;
  
  try {
    // Check if FFmpeg is available first
    const available = await isFFmpegAvailable();
    if (!available) {
      ffmpegError.value = "FFmpeg no está disponible en este navegador. Verifica la compatibilidad.";
      console.error("FFmpeg not available");
    }

    for (const file of files) {
      if (file.size > MAX_BYTES) {
        console.warn("Skipped " + file.name + ": exceeds " + maxSizeText + "MB");
        continue;
      }

      try {
        // Analyze video file using FFmpeg - throws if fails
        const analysis = await analyzeVideoFile(file);
        
        const pendingFile: PendingFile = {
          id: crypto.randomUUID(),
          file,
          type: "video",
          mediaType: "video",
          name: file.name,
          size: file.size,
          hasVideo: analysis.hasVideo,
          audioTracks: analysis.audioTracks,
          subtitleTracks: analysis.subtitleTracks,
          processingComplete: false
        };

        pendingFiles.value.push(pendingFile);
      } catch (analysisError) {
        console.error("FFmpeg analysis failed for " + file.name + ":", analysisError);
        ffmpegError.value = `Error al analizar ${file.name}: ${(analysisError as Error).message}`;
        
        // Notify user of the error
        emitter.emit("show-notification", {
          type: "error",
          message: `Error al analizar video: ${(analysisError as Error).message}`,
        });
      }
    }

    if (pendingFiles.value.length > 0) {
      pendingFileId.value = pendingFiles.value[0].id;
      showTrackSelector.value = true;
    }
  } finally {
    isFFmpegLoading.value = false;
  }
};

const processOtherFiles = async (files: File[], isSelection: boolean) => {
  isUploading.value = true;
  try {
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        console.warn("Skipped " + file.name + ": exceeds " + maxSizeText + "MB");
        continue;
      }
      
      const mediaType = detectMediaType(file);
      if (!mediaType) {
        console.warn("Skipped " + file.name + ": unsupported format");
        continue;
      }

      try {
        const res = await mediaApi.uploadMedia(mediaType, file, { 
          fileName: file.name, 
          metadata: { size: file.size, type: file.type } 
        });
        
        emitter.emit("show-notification", {
          type: "success",
          message: "Archivo " + file.name + " subido con exito.",
        });

        if (isSelection && res && res.id) {
          selectedItemId.value = res.id;
          emitter.emit(MediaEvents.selectedMedia, {
            id: res.id,
            name: file.name,
            type: mediaType,
            url: res.url || ""
          });
        }
      } catch (err) {
        console.error("Failed to upload " + file.name + ":", err);
        emitter.emit("show-notification", {
          type: "error",
          message: "Error al subir " + file.name + ".",
        });
      }
    }
  } finally {
    isUploading.value = false;
  }
};

const handleFiles = async (fileList: FileList | File[], isSelection = false) => {
  const files = Array.from(fileList as File[]);
  if (!files.length) return;

  // For video files, show track selector
  const videoFiles = files.filter(f => detectMediaType(f) === "video");
  const otherFiles = files.filter(f => detectMediaType(f) !== "video");

  if (videoFiles.length > 0) {
    await processVideoFiles(videoFiles, isSelection);
  }

  if (otherFiles.length > 0) {
    await processOtherFiles(otherFiles, isSelection);
  }
};

// Track selection functions
const toggleAudioTrack = (fileId: string, trackId: string) => {
  const file = pendingFiles.value.find(f => f.id === fileId);
  if (file) {
    const track = file.audioTracks.find(t => t.id === trackId);
    if (track) {
      track.selected = !track.selected;
    }
  }
};

const toggleSubtitleTrack = (fileId: string, trackId: string) => {
  const file = pendingFiles.value.find(f => f.id === fileId);
  if (file) {
    const track = file.subtitleTracks.find(t => t.id === trackId);
    if (track) {
      track.selected = !track.selected;
    }
  }
};

const hasSelectedTracks = computed(() => {
  const file = pendingFiles.value.find(f => f.id === pendingFileId.value);
  if (!file) return false;
  
  const hasVideoSelected = file.hasVideo;
  const hasAudioSelected = file.audioTracks.some(t => t.selected);
  const hasSubtitleSelected = file.subtitleTracks.some(t => t.selected);
  
  return hasVideoSelected || hasAudioSelected || hasSubtitleSelected;
});

const getSelectedTrackSummary = computed(() => {
  const file = pendingFiles.value.find(f => f.id === pendingFileId.value);
  if (!file) return "";
  
  const parts: string[] = [];
  if (file.hasVideo) parts.push("Video");
  if (file.audioTracks.some(t => t.selected)) parts.push(file.audioTracks.filter(t => t.selected).length + " Audio(s)");
  if (file.subtitleTracks.some(t => t.selected)) parts.push(file.subtitleTracks.filter(t => t.selected).length + " Subtitulo(s)");
  
  return parts.join(" + ");
});

// Upload selected tracks
const uploadSelectedTracks = async () => {
  const file = pendingFiles.value.find(f => f.id === pendingFileId.value);
  if (!file) return;

  isUploading.value = true;
  try {
    // Upload video if selected
    if (file.hasVideo) {
      try {
        await mediaApi.uploadMedia("video", file.file, { 
          fileName: file.name, 
          metadata: { size: file.size, type: file.file.type }
        });
        emitter.emit("show-notification", {
          type: "success",
          message: "Video " + file.name + " subido correctamente.",
        });
      } catch (err) {
        console.error("Failed to upload video:", err);
        emitter.emit("show-notification", {
          type: "error",
          message: "Error al subir video " + file.name + ".",
        });
      }
    }

    // Note: Audio tracks and subtitles are embedded in the video file
    if (file.audioTracks.some(t => t.selected) || file.subtitleTracks.some(t => t.selected)) {
      emitter.emit("show-notification", {
        type: "info",
        message: "Tracks seleccionados seran incluidos en: " + file.name,
      });
    }

    file.processingComplete = true;
    pendingFiles.value = pendingFiles.value.filter(f => f.id !== file.id);

    // Move to next pending file or close
    if (pendingFiles.value.length > 0) {
      pendingFileId.value = pendingFiles.value[0].id;
    } else {
      showTrackSelector.value = false;
      emitter.emit("upload-complete", {});
    }
  } finally {
    isUploading.value = false;
  }
};

const skipVideoAndUploadTracks = async () => {
  const file = pendingFiles.value.find(f => f.id === pendingFileId.value);
  if (!file) return;

  isUploading.value = true;
  try {
    if (file.audioTracks.some(t => t.selected) || file.subtitleTracks.some(t => t.selected)) {
      emitter.emit("show-notification", {
        type: "info",
        message: "Para extraer tracks especificos, se requiere procesamiento adicional.",
      });
    }

    file.processingComplete = true;
    pendingFiles.value = pendingFiles.value.filter(f => f.id !== file.id);

    if (pendingFiles.value.length > 0) {
      pendingFileId.value = pendingFiles.value[0].id;
    } else {
      showTrackSelector.value = false;
      emitter.emit("upload-complete", {});
    }
  } finally {
    isUploading.value = false;
  }
};

const cancelCurrentFile = () => {
  const file = pendingFiles.value.find(f => f.id === pendingFileId.value);
  if (file) {
    file.processingComplete = true;
    pendingFiles.value = pendingFiles.value.filter(f => f.id !== file.id);
  }

  if (pendingFiles.value.length > 0) {
    pendingFileId.value = pendingFiles.value[0].id;
  } else {
    showTrackSelector.value = false;
  }
};

const skipAllVideos = () => {
  pendingFiles.value = [];
  showTrackSelector.value = false;
  emitter.emit("show-notification", {
    type: "info",
    message: "Videos omitidos. Continua con otros archivos.",
  });
};

// Navigation
const nextPendingFile = () => {
  const currentIndex = pendingFiles.value.findIndex(f => f.id === pendingFileId.value);
  if (currentIndex < pendingFiles.value.length - 1) {
    pendingFileId.value = pendingFiles.value[currentIndex + 1].id;
  }
};

const prevPendingFile = () => {
  const currentIndex = pendingFiles.value.findIndex(f => f.id === pendingFileId.value);
  if (currentIndex > 0) {
    pendingFileId.value = pendingFiles.value[currentIndex - 1].id;
  }
};

const currentFile = computed(() => {
  return pendingFiles.value.find(f => f.id === pendingFileId.value);
});

const currentFileIndex = computed(() => {
  return pendingFiles.value.findIndex(f => f.id === pendingFileId.value);
});

const onSelectClick = () => fileInput.value?.click();

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length) {
    await handleFiles(files);
  }
  if (input) input.value = "";
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
  emitter.emit("show-notification", {
    type: "info",
    message: isSelectionMode.value ? "Modo seleccion activado" : "Modo seleccion desactivado",
  });
};

const handleSelection = async (fileList: FileList | File[]) => {
  await handleFiles(fileList, true);
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
  if (input) input.value = "";
};

const onDropForSelection = async (e: DragEvent) => {
  if (!isSelectionMode.value) return;
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    await handleSelection(files);
  }
};

// Cleanup on unmount
const cleanupFFmpeg = async () => {
  await unloadFFmpeg();
};
</script>

<template>
  <!-- Track Selector Modal -->
  <div 
    v-if="showTrackSelector" 
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">Configurar Subida</h2>
          <p class="text-sm text-slate-400 mt-1">Selecciona que elementos subir</p>
        </div>
        <button 
          @click="skipAllVideos"
          class="text-slate-400 hover:text-white transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- FFmpeg Error Display -->
      <div v-if="ffmpegError" class="p-4 bg-red-900/20 border-b border-red-700">
        <div class="flex items-center gap-3 text-red-400">
          <span class="material-symbols-outlined">error</span>
          <span class="text-sm">{{ ffmpegError }}</span>
        </div>
      </div>

      <!-- File Info -->
      <div v-if="currentFile" class="p-6 border-b border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl text-blue-400">video_file</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-white">{{ currentFile.name }}</h3>
            <p class="text-sm text-slate-400">{{ formatFileSize(currentFile.size) }}</p>
          </div>
          <!-- Navigation -->
          <div v-if="pendingFiles.length > 1" class="flex items-center gap-2">
            <button 
              @click="prevPendingFile"
              :disabled="currentFileIndex === 0"
              class="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <span class="text-sm text-slate-400">
              {{ currentFileIndex + 1 }} / {{ pendingFiles.length }}
            </span>
            <button 
              @click="nextPendingFile"
              :disabled="currentFileIndex === pendingFiles.length - 1"
              class="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Track Selection -->
      <div v-if="currentFile" class="p-6 overflow-y-auto max-h-[50vh]">
        <!-- Video Track -->
        <div class="mb-6">
          <label class="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
            <input 
              type="checkbox" 
              v-model="currentFile.hasVideo"
              class="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <span class="material-symbols-outlined text-blue-400">videocam</span>
            <span class="font-medium text-white">Video Principal</span>
          </label>
        </div>

        <!-- Audio Tracks -->
        <div v-if="currentFile.audioTracks.length > 0" class="mb-6">
          <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">audiotrack</span>
            Audio Tracks ({{ currentFile.audioTracks.filter(t => t.selected).length }} selected)
          </h4>
          <div class="space-y-2">
            <label 
              v-for="track in currentFile.audioTracks" 
              :key="track.id"
              class="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <input 
                type="checkbox" 
                :checked="track.selected"
                @change="toggleAudioTrack(currentFile.id, track.id)"
                class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-green-500"
              />
              <span class="material-symbols-outlined text-green-400 text-sm">volume_up</span>
              <div class="flex-1">
                <span class="text-white text-sm">{{ track.name }}</span>
                <span v-if="track.language !== 'und'" class="text-xs text-slate-500 ml-2">
                  ({{ track.language }})
                </span>
              </div>
              <span class="text-xs text-slate-500">{{ track.codec }}</span>
            </label>
          </div>
        </div>

        <!-- Subtitle Tracks -->
        <div v-if="currentFile.subtitleTracks.length > 0">
          <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">closed_caption</span>
            Subtitulos ({{ currentFile.subtitleTracks.filter(t => t.selected).length }} selected)
          </h4>
          <div class="space-y-2">
            <label 
              v-for="track in currentFile.subtitleTracks" 
              :key="track.id"
              class="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <input 
                type="checkbox" 
                :checked="track.selected"
                @change="toggleSubtitleTrack(currentFile.id, track.id)"
                class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
              />
              <span class="material-symbols-outlined text-yellow-400 text-sm">subtitles</span>
              <div class="flex-1">
                <span class="text-white text-sm">{{ track.name }}</span>
                <span v-if="track.language !== 'und'" class="text-xs text-slate-500 ml-2">
                  ({{ track.language }})
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- No tracks message -->
        <div v-if="currentFile.audioTracks.length === 0 && currentFile.subtitleTracks.length === 0" 
             class="text-center py-8 text-slate-500">
          <span class="material-symbols-outlined text-4xl mb-2">info</span>
          <p>No se detectaron tracks adicionales</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 border-t border-slate-700 flex items-center justify-between">
        <button 
          @click="cancelCurrentFile"
          class="px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          Omitir archivo
        </button>
        <div class="flex items-center gap-3">
          <button 
            @click="skipVideoAndUploadTracks"
            :disabled="!currentFile?.audioTracks.some(t => t.selected) && !currentFile?.subtitleTracks.some(t => t.selected)"
            class="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Solo Subtítulos/Audio
          </button>
          <button 
            @click="uploadSelectedTracks"
            :disabled="!hasSelectedTracks || isUploading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span v-if="isUploading" class="animate-spin">
              <span class="material-symbols-outlined">sync</span>
            </span>
            <span v-else class="material-symbols-outlined">cloud_upload</span>
            Confirmar Subida
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Upload UI -->
  <div 
    class="w-full max-w-3xl mx-auto rounded-md"
    @drop="isSelectionMode ? onDropForSelection($event) : onDrop($event)"
    @dragover="onDragOver"
    :class="{ 'ring-2 ring-blue-500': isSelectionMode }"
  >
    <!-- Loading State -->
    <div v-if="isFFmpegLoading" class="flex flex-col items-center justify-center py-24">
      <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <span class="text-white font-medium">Analizando video...</span>
      <span class="text-sm text-slate-400 mt-1">Detectando tracks de audio y subtitulos</span>
    </div>

    <!-- FFmpeg Error State -->
    <div v-else-if="ffmpegError" class="flex flex-col items-center justify-center py-24">
      <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-red-400">error</span>
      </div>
      <span class="text-white font-medium">Error de FFmpeg</span>
      <span class="text-sm text-slate-400 mt-1">{{ ffmpegError }}</span>
      <button 
        @click="ffmpegError = null"
        class="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Upload Area -->
    <div v-else class="flex flex-col items-center text-center py-24">
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
      <small class="block text-[11.2px] text-white/70">Supported formats: {{ mediaText }}</small>
      <small class="block text-[11.2px] text-white/70">Max file size: <b class="font-bold text-white">{{ maxSizeText }}MB</b></small>
      <small v-if="pendingFiles.length > 0" class="block text-[11.2px] text-blue-300 mt-2">
        <b class="font-bold">Archivos pendientes:</b> {{ pendingFiles.length }} archivo(s) esperando configuracion
      </small>
      <small v-if="isSelectionMode" class="block text-[11.2px] text-blue-300 mt-2">
        <b class="font-bold">Modo seleccion:</b> Solo se procesara el primer archivo
      </small>
    </div>
    
    <input 
      ref="fileInput"
      type="file" 
      name="upload[]" 
      :multiple="!isSelectionMode"
      :accept="mediaAccept"  
      class="hidden" 
      @change="isSelectionMode ? onFileSelectionChange($event) : onFileChange($event)"
    /> 
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

input[type="checkbox"] {
  cursor: pointer;
}
</style>
