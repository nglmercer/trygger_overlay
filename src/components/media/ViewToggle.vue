<script setup lang="ts">
type ViewMode = 'grid' | 'list';

const viewMode = defineModel<ViewMode>('viewMode', { required: true });
</script>

<template>
    <div class="flex items-center bg-neutral-900 rounded-md p-1">
        <button 
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-md transition-colors', 
              viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/10'
            ]"
            aria-label="Grid View"
        >
            <span class="material-symbols-outlined">grid_view</span>
        </button>
        <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/10'
            ]"
            aria-label="List View"
        >
            <span class="material-symbols-outlined">view_list</span>
        </button>
    </div>
</template>