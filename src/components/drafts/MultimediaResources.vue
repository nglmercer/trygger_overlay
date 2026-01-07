<script setup lang="ts">
import { computed } from 'vue';
import MaterialVue from '@components/static/MaterialVue.vue';

interface MediaItem {
  id: string | number;
  name: string;
  type: string;
  url?: string | null;
  size?: string;
  resolution?: string;
  duration?: string;
  language?: string;
  format?: string;
  status?: string;
}

interface Props {
  selectedItems: MediaItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'open-selector': [options: { type: string; tab: string }];
  'remove-item': [id: string | number];
}>();

// Categorize selected items for the different sections
const mainVideo = computed(() => props.selectedItems.find(i => i.type === 'video'));
const videoCover = computed(() => props.selectedItems.find(i => i.type === 'image'));
const audioTracks = computed(() => props.selectedItems.filter(i => i.type === 'audio'));
const subtitles = computed(() => props.selectedItems.filter(i => i.type === 'subtitle'));

const openSelector = (type: string, tab: string = 'Images') => {
  emit('open-selector', { type, tab });
};

const removeItem = (id: string | number) => {
  emit('remove-item', id);
};

</script>

<template>
  <div class="multimedia-resources-card bg-[#0f172a]/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
    <!-- Header -->
    <div class="p-5 border-b border-slate-800 flex items-start gap-4">
      <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
        <MaterialVue class="text-blue-400">perm_media</MaterialVue>
      </div>
      <div>
        <h3 class="text-white font-semibold text-lg">Multimedia Resources</h3>
        <p class="text-slate-400 text-sm">Manage the visual and audio assets for your video draft.</p>
      </div>
    </div>

    <!-- Body Sections -->
    <div class="p-6 space-y-8">
      
      <!-- Video File Section -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-slate-300">
            <MaterialVue class="text-xl">movie</MaterialVue>
            <span class="font-medium text-sm">Video File</span>
          </div>
          <div v-if="mainVideo" class="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded">
            <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span class="text-[10px] font-bold text-green-500 uppercase tracking-wider">Uploaded</span>
          </div>
        </div>

        <div v-if="mainVideo" class="bg-[#1e293b] border border-slate-700 rounded-lg p-4 flex items-center gap-4 group">
          <div class="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-blue-400 flex-shrink-0">
            <MaterialVue>play_circle</MaterialVue>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-white truncate">{{ mainVideo.name }}</span>
              <button @click="removeItem(mainVideo.id)" class="text-slate-500 hover:text-red-400">
                <MaterialVue class="text-lg">delete</MaterialVue>
              </button>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-[11px] text-slate-400">{{ mainVideo.size || '1.2 GB' }}</span>
              <span class="text-[11px] text-slate-500">•</span>
              <span class="text-[11px] text-slate-400">{{ mainVideo.resolution || '1920×1080' }}</span>
              <span class="text-[11px] text-slate-500">•</span>
              <span class="text-[11px] text-slate-400">{{ mainVideo.duration || '04:32' }}</span>
            </div>
            <div class="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full w-full"></div>
            </div>
          </div>
        </div>
        <div v-else @click="openSelector('video', 'Videos')" class="border-2 border-dashed border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
             <MaterialVue class="text-slate-600 group-hover:text-blue-400 transition-colors">video_library</MaterialVue>
             <p class="text-slate-400 text-xs text-center">Select the main video file</p>
        </div>
      </section>

      <!-- Video Cover Section -->
      <section class="space-y-3">
        <div class="flex items-center gap-2 text-slate-300">
          <MaterialVue class="text-xl">image</MaterialVue>
          <span class="font-medium text-sm">Video Cover</span>
        </div>

        <div v-if="videoCover" class="relative group aspect-video max-w-lg mx-auto rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
            <img v-if="videoCover.url" :src="videoCover.url" class="w-full h-full object-contain" />
            <div v-else class="text-slate-600 flex flex-col items-center gap-2">
                <MaterialVue class="text-4xl text-slate-700">image</MaterialVue>
                <span class="text-xs">{{ videoCover.name }}</span>
            </div>
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
               <button @click="removeItem(videoCover.id)" class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700">
                  <MaterialVue>delete</MaterialVue>
               </button>
            </div>
        </div>
        <div v-else class="border-2 border-dashed border-slate-800 rounded-xl p-10 bg-[#0f172a]/20 flex flex-col items-center justify-center gap-5 text-center transition-all hover:bg-[#0f172a]/40">
           <div class="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-blue-400/80">
              <MaterialVue>add_photo_alternate</MaterialVue>
           </div>
           <div>
             <p class="text-white text-sm font-medium">Drag & drop cover image</p>
             <p class="text-slate-500 text-[11px] mt-1">16:9 aspect ratio • Max 5MB</p>
           </div>
           <div class="flex items-center gap-2">
              <button @click="openSelector('image', 'Images')" class="px-5 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium flex items-center gap-2 hover:bg-slate-700 transition-colors">
                 <MaterialVue class="text-lg">grid_view</MaterialVue>
                 Library
              </button>
              <button @click="openSelector('image', 'Upload')" class="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                 <MaterialVue class="text-lg">upload</MaterialVue>
                 Upload
              </button>
           </div>
        </div>

        <div class="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
           <MaterialVue class="text-blue-400 text-lg">info</MaterialVue>
           <span class="text-blue-300 text-[11px]">Used as the preview on the discovery page.</span>
        </div>
      </section>

      <!-- Audio Tracks Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-slate-300">
            <MaterialVue class="text-xl">music_note</MaterialVue>
            <span class="font-medium text-sm">Audio Tracks</span>
          </div>
          <span class="text-[11px] text-slate-500">{{ audioTracks.length }} tracks added</span>
        </div>

        <div class="space-y-2">
            <!-- Add Audio Row -->
            <div @click="openSelector('audio', 'Sounds')" class="border-2 border-dashed border-slate-800 rounded-lg p-3 flex items-center justify-between group cursor-pointer hover:border-slate-700">
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400">
                     <MaterialVue>add_box</MaterialVue>
                  </div>
                  <div class="text-left">
                     <p class="text-slate-300 text-xs font-medium">Add Audio Track</p>
                     <p class="text-slate-500 text-[10px]">Drag files here</p>
                  </div>
               </div>
               <div class="flex items-center gap-2">
                  <button @click.stop="openSelector('audio', 'Sounds')" class="h-8 px-3 rounded bg-slate-800 text-white text-[10px] flex items-center gap-2 hover:bg-slate-700">
                     <MaterialVue class="text-base">grid_view</MaterialVue> Library
                  </button>
                  <button @click.stop="openSelector('audio', 'Upload')" class="h-8 px-3 rounded bg-blue-600 text-white text-[10px] flex items-center gap-2 hover:bg-blue-700">
                     <MaterialVue class="text-base">upload</MaterialVue> Upload
                  </button>
               </div>
            </div>

            <!-- List Audios -->
            <div v-for="track in audioTracks" :key="track.id" class="bg-[#1e293b] border border-slate-700/50 rounded-lg p-3 flex items-center justify-between group">
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-blue-400">
                     <MaterialVue class="text-lg">graphic_eq</MaterialVue>
                  </div>
                  <div>
                    <p class="text-white text-xs font-medium">{{ track.name }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                       <span class="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-[9px] font-bold rounded">{{ track.language || 'ENG' }}</span>
                       <span class="text-slate-500 text-[10px]">{{ track.duration || '4:32' }}</span>
                       <span class="text-slate-500 text-[10px]">•</span>
                       <span class="text-slate-500 text-[10px]">{{ track.size || '5.2 MB' }}</span>
                    </div>
                  </div>
               </div>
               <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-2 text-slate-500 hover:text-white"><MaterialVue class="text-lg">play_arrow</MaterialVue></button>
                  <button @click="removeItem(track.id)" class="p-2 text-slate-500 hover:text-red-400"><MaterialVue class="text-lg">delete</MaterialVue></button>
               </div>
            </div>
        </div>
      </section>

      <!-- Subtitles Section -->
      <section class="space-y-4">
        <div class="flex items-center gap-2 text-slate-300">
          <MaterialVue class="text-xl">closed_caption</MaterialVue>
          <span class="font-medium text-sm">Subtitles / Captions</span>
        </div>

        <div class="space-y-2">
            <!-- Add Subtitles Row -->
            <div @click="openSelector('subtitle', 'Upload')" class="border-2 border-dashed border-slate-800 rounded-lg p-3 flex items-center justify-between group cursor-pointer hover:border-slate-700">
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400">
                     <MaterialVue>closed_caption</MaterialVue>
                  </div>
                  <div class="text-left">
                     <p class="text-slate-300 text-xs font-medium">Add Subtitle File</p>
                     <p class="text-slate-500 text-[10px]">Drag files here</p>
                  </div>
               </div>
               <div class="flex items-center gap-2">
                  <button @click.stop="openSelector('subtitle', 'Images')" class="h-8 px-3 rounded bg-slate-800 text-white text-[10px] flex items-center gap-2 hover:bg-slate-700">
                     <MaterialVue class="text-base">grid_view</MaterialVue> Library
                  </button>
                  <button @click.stop="openSelector('subtitle', 'Upload')" class="h-8 px-3 rounded bg-blue-600 text-white text-[10px] flex items-center gap-2 hover:bg-blue-700">
                     <MaterialVue class="text-base">upload</MaterialVue> Upload
                  </button>
               </div>
            </div>

            <!-- List Subtitles -->
            <div v-for="sub in subtitles" :key="sub.id" class="bg-[#1e293b] border border-slate-700/50 rounded-lg p-3 flex items-center justify-between group">
               <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded bg-amber-500/10 flex items-center justify-center text-amber-500">
                     <MaterialVue class="text-lg">subtitles</MaterialVue>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                       <p class="text-white text-xs font-medium">{{ sub.name }}</p>
                       <span class="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold rounded uppercase">Active</span>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                       <span class="text-slate-400 text-[10px] font-medium">{{ sub.language || 'ENG' }}</span>
                       <span class="text-slate-500 text-[10px]">•</span>
                       <span class="text-slate-400 text-[10px]">{{ sub.format || 'SRT Format' }}</span>
                       <span class="text-slate-500 text-[10px]">•</span>
                       <span class="text-slate-400 text-[10px]">{{ sub.size || '128 KB' }}</span>
                    </div>
                  </div>
               </div>
               <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-2 text-slate-500 hover:text-white"><MaterialVue class="text-lg">edit_note</MaterialVue></button>
                  <button @click="removeItem(sub.id)" class="p-2 text-slate-500 hover:text-red-400"><MaterialVue class="text-lg">delete</MaterialVue></button>
               </div>
            </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Transiciones suaves para hovers */
button, div, MaterialVue {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
