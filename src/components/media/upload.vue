<script setup lang="ts">
import { ref, watch } from 'vue';
import SearchInput from '@components/media/SearchInput.vue';
import SortDropdown from '@components/media/SortDropdown.vue';
import ViewToggle from '@components/media/ViewToggle.vue';
import UsageStats from '@components/media/UsageStats.vue';  
import EmptyState from '@components/media/EmptyState.vue';
import UploadTab from '@components/media/UploadTab.vue';
import MediaGallery from '@components/content/MediaGallery.vue';
import { mediaApi, type MediaType } from '@utils/fetch/fetchapi.ts';
import { emitter } from '@utils/Emitter';
import type { Tab } from '@components/types';
type ViewMode = 'grid' | 'list';

const TABS: { id: Tab; icon: string }[] = [
  { id: 'Images', icon: 'photo_library' },
  { id: 'Videos', icon: 'video_library' },
  { id: 'Sounds', icon: 'audio_file' },
  { id: 'Upload', icon: 'upload_file' },
];
const tabsType: Record<Exclude<Tab, 'Upload'>, MediaType> = {
  'Images': 'image',
  'Videos': 'video',
  'Sounds': 'audio',
  'Subtitles': 'subtitle'
};

const activeTab = ref<Tab>('Images');
const viewMode = ref<ViewMode>('grid');
const mediaItems = ref<any[]>([]);
function closeModal(){
  console.log("closeModal")
  emitter.emit('uploadModal',false)
}

// Watch for changes in activeTab and fetch corresponding media
watch(
  () => activeTab.value,
  async (newTab) => {
    if (!newTab || newTab === 'Upload') return;
    try {
      if (tabsType[newTab]) {
        const result = await mediaApi.getByType(tabsType[newTab]);
        console.log("result", result)
        mediaItems.value = result;
      } 
    } catch (error) {
      console.error('Error fetching media:', error);
      mediaItems.value = [];
    }
  },
  { immediate: true } // Fetch data immediately when component mounts
);

const handleSearch = (query: string) => {
  console.log("query", query);
  // IMPLEMENT example: not work //mediaItems.value = mediaItems.value.filter((item) => item.name.includes(query));
}
</script>
<template>
  <div class="w-full max-w-5xl min-h-[50dvh] bg-neutral-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh] origin-center transition-transform duration-300 font-sans">
    <!-- Header -->
    <header class="bg-neutral-900/70 p-4 rounded-t-lg flex-shrink-0">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 w-full">
          <h1 class="text-2xl font-medium text-white tracking-tight">Select Media</h1>
          <button 
            class="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 absolute top-4 right-4" 
            aria-label="Close"
            @click=closeModal
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        <div class="flex sm:flex-nowrap flex-wrap items-center space-x-4"> 
          <SearchInput @search="handleSearch" />
          <SortDropdown />
          <ViewToggle v-model:viewMode="viewMode" />
        </div>
        <div class="hidden md:block flex-1"></div>
        <div class="flex items-center gap-4 mx-6">
          <UsageStats />
        </div>
      </div>
    </header>

    <hr class="border-t border-white/10" />

    <!-- Tabs -->
    <nav class="relative flex-shrink-0 bg-neutral-800">
      <div class="flex items-center justify-start border-b border-white/10 overflow-auto">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex flex-col items-center justify-center gap-1.5 px-6 py-4 text-sm font-medium transition-colors w-1/4 min-w-[120px]',
            { 
              'text-indigo-400 border-b-2 border-indigo-400': activeTab === tab.id,
              'text-white/60 hover:text-white hover:bg-white/5': activeTab !== tab.id
            }
          ]"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          <span class="uppercase tracking-wider">{{ tab.id }}</span>
        </button>
      </div>
    </nav>
    
    <!-- Content -->
    <main class="flex-grow overflow-y-auto bg-neutral-800 rounded-b-lg p-2 justify-center align-center">
      <UploadTab :class="{ 'hidden': activeTab !== 'Upload' }" />
      <EmptyState 
        v-if="mediaItems.length === 0"
        :type="activeTab" 
        @go-upload="activeTab = 'Upload'"
        :class="{ 'hidden': activeTab === 'Upload' }"
      />
      <MediaGallery 
        :media-type="tabsType[activeTab as Exclude<Tab, 'Upload'>]"
        :class="{ 'hidden': activeTab === 'Upload' || mediaItems.length === 0 }"
      />
    </main>
  </div>
</template>