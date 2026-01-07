<script setup lang="ts">
import { ref, watch, onMounted, computed, reactive } from 'vue';
import type { Tab } from '@components/types';
import SearchInput from '@components/media/SearchInput.vue';
import UsageStats from '@components/media/UsageStats.vue';  
import EmptyState from '@components/media/EmptyState.vue';
import UploadTab from '@components/media/UploadTab.vue';
import MediaGallery from '@components/content/MediaGallery.vue';
import { mediaApi, type MediaType, type MediaItem } from '@utils/fetch/fetchapi.ts';
import { emitter } from '@utils/Emitter';

const TABS: { id: Tab; icon: string }[] = [
  { id: 'Images', icon: 'photo_library' },
  { id: 'Videos', icon: 'video_library' },
  { id: 'Sounds', icon: 'audio_file' },
  { id: 'Subtitles', icon: 'closed_caption' },
  { id: 'Upload', icon: 'upload_file' },
];

const tabsType: Record<Exclude<Tab, 'Upload'>, MediaType> = {
  'Images': 'image',
  'Videos': 'video',
  'Sounds': 'audio',
  'Subtitles': 'subtitle'
};

const activeTab = ref<Tab>('Images');
const mediaItems = ref<MediaItem[]>([]);
const searchQuery = ref('');
const isContentLoading = ref(false);

const counts = reactive<Record<string, number>>({
  Images: 0,
  Videos: 0,
  Sounds: 0,
  Subtitles: 0
});

function closeModal(){
  emitter.emit('uploadModal', false)
}

const filteredMediaItems = computed(() => {
  if (!searchQuery.value.trim()) return mediaItems.value;
  const q = searchQuery.value.toLowerCase();
  return mediaItems.value.filter(item => 
    item.name?.toLowerCase().includes(q) || 
    item.id?.toString().toLowerCase().includes(q)
  );
});

async function refreshStats() {
  try {
    const stats = await mediaApi.getStats();
    if (stats && stats.byType) {
      counts.Images = stats.byType.image?.count || 0;
      counts.Videos = stats.byType.video?.count || 0;
      counts.Sounds = stats.byType.audio?.count || 0;
      counts.Subtitles = stats.byType.subtitle?.count || 0;
    }
  } catch (e) {
    console.error("Error refreshing stats:", e);
  }
}

async function fetchMediaItems(tab: Tab) {
  if (!tab || tab === 'Upload') {
    mediaItems.value = [];
    return;
  }
  
  isContentLoading.value = true;
  try {
    const type = tabsType[tab as Exclude<Tab, 'Upload'>];
    if (type) {
      const result = await mediaApi.getByType(type);
      if (Array.isArray(result)) {
         mediaItems.value = result;
      } else if (result && typeof result === 'object') {
         mediaItems.value = Object.keys(result).map(key => ({
            id: key,
            name: (result as any)[key].name || key,
            type: type,
            url: (result as any)[key].url || ''
         } as MediaItem));
      } else {
         mediaItems.value = [];
      }
      counts[tab as keyof typeof counts] = mediaItems.value.length;
    } 
  } catch (error) {
    console.error('Error fetching media:', error);
    mediaItems.value = [];
  } finally {
    isContentLoading.value = false;
  }
}

watch(activeTab, (newTab) => {
  fetchMediaItems(newTab);
}, { immediate: true });

const handleSearch = (query: string) => {
  searchQuery.value = query;
}

onMounted(() => {
  refreshStats();
  
  emitter.on('uploadModal', (options: any) => {
    if (options && typeof options === 'object') {
      if (options.tab && TABS.find(t => (t.id as string) === (options.tab as string))) {
        activeTab.value = options.tab;
      }
      refreshStats();
      fetchMediaItems(activeTab.value);
    }
  });
  
  emitter.on('upload-complete', () => {
    refreshStats();
    fetchMediaItems(activeTab.value);
  });
});
</script>

<template>
  <!-- ESTABILIZACION TOTAL: Dimensiones estrictas -->
  <div class="media-library-root bg-[#0f172a] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col font-sans border border-slate-800/50 overflow-hidden select-none">
    <!-- Header Decor -->
    <div class="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shrink-0"></div>

    <!-- Header: Altura fija -->
    <header class="bg-slate-900/40 backdrop-blur-xl p-6 border-b border-slate-800/50 shrink-0 h-[100px] flex items-center">
      <div class="flex items-center justify-between w-full gap-6">
        <div class="flex items-center gap-4 shrink-0">
          <div class="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-inner">
            <span class="material-symbols-outlined text-blue-400 text-2xl">perm_media</span>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl font-bold text-white tracking-tight leading-none mb-1">Media Studio</h1>
            <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Asset Manager</p>
          </div>
        </div>

        <div class="flex-1 flex justify-center max-w-md">
          <SearchInput @search="handleSearch" class="w-full" />
        </div>

        <div class="flex items-center gap-6 shrink-0">
          <UsageStats />
          <button 
            class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 hover:border-slate-700 border border-transparent transition-colors duration-200" 
            aria-label="Close"
            @click="closeModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Tabs Navigation: GRID RIGIDO PARA EVITAR SALTOS DE ANCHO -->
    <nav class="shrink-0 bg-slate-900/20 border-b border-slate-800/50 px-6 h-[64px] flex items-center overflow-hidden">
      <!-- Grid de 5 columnas iguales -->
      <div class="grid grid-cols-5 gap-2 w-full h-[44px]">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'group flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap justify-center h-full',
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          ]"
        >
          <span class="material-symbols-outlined text-[18px] shrink-0">{{ tab.icon }}</span>
          <!-- Aseguramos que el texto tenga el mismo ancho reservado siempre -->
          <span class="relative">
              {{ tab.id }}
              <!-- Texto invisible para reservar el espacio de negrita si es que cambia -->
              <span class="block invisible h-0 font-bold overflow-hidden" aria-hidden="true">{{ tab.id }}</span>
          </span>
          
          <span 
            v-if="tab.id !== 'Upload'" 
            :class="[
              'px-1.5 py-0.5 rounded-md text-[9px] flex items-center justify-center min-w-[22px] font-bold shrink-0',
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
            ]"
          >
            {{ counts[tab.id as keyof typeof counts] }}
          </span>
        </button>
      </div>
    </nav>
    
    <!-- Content Area -->
    <main class="flex-grow overflow-hidden relative bg-[#020617]">
      
      <div v-if="isContentLoading" class="absolute inset-0 bg-[#020617]/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
         <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span class="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Syncing Library</span>
         </div>
      </div>

      <div class="h-full overflow-y-auto p-8 custom-scrollbar">
          <!-- Secciones ... -->
          <div v-if="activeTab === 'Upload'" class="h-full">
            <UploadTab />
          </div>

          <div v-else class="min-h-full">
            <div class="mb-6 h-[24px] flex items-center justify-between shrink-0">
               <div class="flex items-center gap-3">
                  <h2 class="text-base font-bold text-white">{{ activeTab }}</h2>
                  <div class="h-3 w-[1px] bg-slate-800"></div>
                  <p class="text-xs text-slate-500 uppercase tracking-tighter">
                     {{ searchQuery ? 'Search Matches' : 'Local Archive' }}
                  </p>
               </div>
               <div v-if="searchQuery" class="flex items-center gap-3">
                  <span class="text-[10px] text-slate-400 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 uppercase font-black tracking-widest">
                    {{ filteredMediaItems.length }}
                  </span>
                  <button @click="searchQuery = ''" class="text-xs text-blue-500 hover:text-white transition-colors font-medium">Clear</button>
               </div>
            </div>

            <EmptyState 
              v-if="mediaItems.length === 0 && !isContentLoading"
              :type="activeTab" 
              @go-upload="activeTab = 'Upload'"
            />

            <div v-else-if="filteredMediaItems.length === 0 && searchQuery && !isContentLoading" class="flex flex-col items-center justify-center py-20">
               <span class="material-symbols-outlined text-4xl text-slate-700 mb-4">search_off</span>
               <p class="text-slate-500 font-medium text-sm italic">Nothing matches your search</p>
            </div>

            <MediaGallery 
              v-show="filteredMediaItems.length > 0"
              :media-type="tabsType[activeTab as Exclude<Tab, 'Upload'>]"
              :show-selection-button="true"
            />
          </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900/80 backdrop-blur-md px-8 h-[60px] border-t border-slate-800/50 flex justify-between items-center shrink-0">
       <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
             <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"></div>
             <span class="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">Live Connection</span>
          </div>
       </div>
       <div class="flex items-center gap-3 px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg">
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Select from gallery to continue</p>
       </div>
    </footer>
  </div>
</template>

<style scoped>
.media-library-root {
  width: 1200px;
  height: 800px;
  max-width: 95vw;
  max-height: 90vh;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #334155;
}



/* Solo permitir transiciones de color y decoraciones */
.transition-all {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter !important;
}

main > div {
  animation: contentFadeIn 0.2s ease-out;
}

@keyframes contentFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
