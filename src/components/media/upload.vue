<script setup lang="ts">
import { ref } from 'vue';
import SearchInput from '@components/media/SearchInput.vue';
import SortDropdown from '@components/media/SortDropdown.vue';
import ViewToggle from '@components/media/ViewToggle.vue';
import UsageStats from '@components/media/UsageStats.vue';  
import EmptyState from '@components/media/EmptyState.vue';
import UploadTab from '@components/media/UploadTab.vue';
type Tab = 'Images' | 'Videos' | 'Sounds' | 'Upload';
type ViewMode = 'grid' | 'list';

const TABS: { id: Tab; icon: string }[] = [
  { id: 'Images', icon: 'photo_library' },
  { id: 'Videos', icon: 'video_library' },
  { id: 'Sounds', icon: 'audio_file' },
  { id: 'Upload', icon: 'upload_file' },
];

const activeTab = ref<Tab>('Images');
const viewMode = ref<ViewMode>('grid');


</script>

<template>
  <div class="w-full max-w-5xl bg-neutral-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh] origin-center transition-transform duration-300 font-sans">
    <!-- Header -->
    <header class="bg-neutral-900/70 p-4 rounded-t-lg flex-shrink-0">
      <div class="flex flex-wrap items-center gap-4">
        <h1 class="text-2xl font-normal text-white pr-4">Select Media</h1>
        <div class="flex-grow hidden md:block"></div>
        <div class="order-3 w-full md:w-auto md:order-none"><SearchInput /></div>
        <SortDropdown />
        <ViewToggle v-model:viewMode="viewMode" />
        <div class="flex-grow"></div>
        <UsageStats />
        <button class="text-white/70 hover:text-white transition-colors" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </header>

    <hr class="border-t border-white/10" />

    <!-- Tabs -->
    <nav class="relative flex-shrink-0 bg-neutral-800">
      <div class="flex items-center justify-start border-b border-white/10">
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
    <main class="flex-grow overflow-y-auto bg-neutral-800 rounded-b-lg p-4">
      <template v-if="activeTab !== 'Upload'">
        <EmptyState :type="activeTab" @go-upload="activeTab = 'Upload'" />
      </template>
      <template v-else>
        <UploadTab />
      </template>
    </main>
  </div>
</template>