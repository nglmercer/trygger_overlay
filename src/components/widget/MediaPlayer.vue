<!-- MediaPlayer.vue for Media Organization -->
<template>
  <div class="media-player-container" ref="containerRef">
    <!-- Media Gallery View -->
    <div v-if="viewMode === 'gallery'" class="gallery-view">
      <div class="media-tabs">
        <button 
          v-for="type in mediaTypes" 
          :key="type"
          @click="selectedMediaType = type"
          :class="['tab-btn', { active: selectedMediaType === type }]"
        >
          {{ type.charAt(0).toUpperCase() + type.slice(1) }}
        </button>
      </div>
      
      <MediaGallery 
        :media-type="selectedMediaType"
        :image-base-url="urlBase"
        @loaded="onMediaLoaded"
        @error="onMediaError"
      />
      
      <!-- Drafts Section -->
      <div class="drafts-section">
        <h3>Drafts</h3>
        <div class="drafts-grid">
          <div 
            v-for="draft in drafts" 
            :key="draft.id"
            class="draft-card"
            @click="loadDraft(draft)"
          >
            <h4>{{ draft.name }}</h4>
            <p>{{ draft.description || 'No description' }}</p>
            <div class="draft-actions">
              <button @click.stop="editDraft(draft)" class="edit-btn">Edit</button>
              <button @click.stop="deleteDraft(draft.id)" class="delete-btn">Delete</button>
            </div>
          </div>
        </div>
        
        <button @click="createNewDraft" class="create-draft-btn">
          + Create New Draft
        </button>
      </div>
    </div>

    <!-- Media Player View -->
    <div v-else-if="viewMode === 'player'" class="player-view">
      <MediaDisplay 
        :current-item="currentMedia"
        :url-base="urlBase"
        @video-loaded="onVideoLoaded"
        @video-ended="onVideoEnded"
        @image-loaded="onImageLoaded"
        @audio-loaded="onAudioLoaded"
        @audio-ended="onAudioEnded"
        @media-error="onMediaError"
      />

      <!-- Media Info Overlay -->
      <MediaInfo 
        v-if="currentMedia"
        :current-item="currentMedia"
        :current-index="currentIndex"
        :queue-length="playQueue.length"
      />

      <!-- Media Controls -->
      <MediaControls
        :queue-length="playQueue.length"
        :is-playing="isPlaying"
        @previous="previousItem"
        @toggle-play-pause="togglePlayPause"
        @next="nextItem"
        @clear-queue="clearQueue"
      />

      <!-- Development Mode Stats -->
      <MediaStats
        v-if="isDevelopmentMode"
        :queue-length="playQueue.length"
        :current-item="currentMedia"
        :time-remaining="timeRemaining"
      />
    </div>

    <!-- View Mode Toggle -->
    <div class="view-controls">
      <button 
        @click="toggleViewMode"
        class="view-toggle-btn"
        :class="{ 'player-mode': viewMode === 'player' }"
      >
        {{ viewMode === 'gallery' ? '📺 Player' : '🖼️ Gallery' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import MediaGallery from '@components/content/MediaGallery.vue';
import MediaDisplay from './MediaDisplay.vue';
import MediaInfo from './MediaInfo.vue';
import MediaControls from './MediaControls.vue';
import MediaStats from './MediaStats.vue';
import MediaApi, { type MediaRecord } from '@utils/fetch/fetchapi';
import { MediaEvents } from 'src/config/events';
import { emitter } from '@utils/Emitter';

// Types
interface MediaDraft {
  id: string;
  name: string;
  description?: string;
  mediaItems: MediaRecord[];
  createdAt: Date;
  updatedAt: Date;
  isDraft: true;
}

interface ExtendedMediaItem extends MediaRecord {
  isDraft?: boolean;
  draftInfo?: MediaDraft;
}

// Props and Emits
const emit = defineEmits<{
  mediaSelected: [media: MediaRecord];
  draftCreated: [draft: MediaDraft];
  draftUpdated: [draft: MediaDraft];
  draftDeleted: [draftId: string];
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const api = new MediaApi({} as any); // Will be initialized with proper config

// State
const urlBase = ref('');
const viewMode = ref<'gallery' | 'player'>('gallery');
const mediaItems = ref<MediaRecord[]>([]);
const drafts = ref<MediaDraft[]>([]);
const playQueue = ref<ExtendedMediaItem[]>([]);
const currentMedia = ref<ExtendedMediaItem | null>(null);
const currentIndex = ref(-1);
const isPlaying = ref(false);
const timeRemaining = ref(0);
const isDevelopmentMode = ref(false);
const selectedMediaType = ref<'image' | 'video' | 'audio'>('image');
const mediaTypes = ['image', 'video', 'audio'] as const;
let durationTimer: NodeJS.Timeout | null = null;

// Computed
const hasMedia = computed(() => mediaItems.value.length > 0);

// View Management
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'gallery' ? 'player' : 'gallery';
};

// Media Management
const loadMediaItems = async () => {
  try {
    const allMedia = await api.getAllMedia();
    mediaItems.value = Object.values(allMedia);
  } catch (error) {
    console.error('Error loading media items:', error);
  }
};

const loadDrafts = () => {
  // Load drafts from localStorage
  const savedDrafts = localStorage.getItem('mediaDrafts');
  if (savedDrafts) {
    drafts.value = JSON.parse(savedDrafts).map((draft: any) => ({
      ...draft,
      createdAt: new Date(draft.createdAt),
      updatedAt: new Date(draft.updatedAt)
    }));
  }
};

const saveDrafts = () => {
  localStorage.setItem('mediaDrafts', JSON.stringify(drafts.value));
};

const onMediaLoaded = (items: any[]) => {
  console.log('Media loaded:', items);
};

const loadDraft = (draft: MediaDraft) => {
  // Convert draft media items to extended media items and add to queue
  draft.mediaItems.forEach(mediaItem => {
    const extendedMedia: ExtendedMediaItem = {
      ...mediaItem,
      isDraft: true,
      draftInfo: draft
    };
    playQueue.value.push(extendedMedia);
  });
  viewMode.value = 'player';
  
  if (playQueue.value.length > 0 && !isPlaying.value) {
    startPlayback();
  }
};

const editDraft = (draft: MediaDraft) => {
  // For now, just emit the event. In a real implementation, 
  // this would open a draft editor modal
  emit('draftUpdated', draft);
};

const deleteDraft = (draftId: string) => {
  onDeleteDraft(draftId);
};

const createNewDraft = () => {
  // For now, create a simple draft with current media items
  const newDraft: MediaDraft = {
    id: `draft_${Date.now()}`,
    name: `Draft ${drafts.value.length + 1}`,
    description: 'Auto-created draft',
    mediaItems: mediaItems.value.slice(0, 3), // Take first 3 items as example
    createdAt: new Date(),
    updatedAt: new Date(),
    isDraft: true
  };
  
  onCreateDraft({
    name: newDraft.name,
    description: newDraft.description,
    mediaItems: newDraft.mediaItems
  });
};

// Event Handlers
const onMediaSelected = (media: MediaRecord) => {
  const extendedMedia: ExtendedMediaItem = {
    ...media,
    isDraft: false
  };
  
  playQueue.value.push(extendedMedia);
  viewMode.value = 'player';
  
  if (playQueue.value.length === 1) {
    startPlayback();
  }
};

const onCreateDraft = (draftData: { name: string; description?: string; mediaItems: MediaRecord[] }) => {
  const newDraft: MediaDraft = {
    id: `draft_${Date.now()}`,
    name: draftData.name,
    description: draftData.description,
    mediaItems: draftData.mediaItems,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDraft: true
  };
  
  drafts.value.push(newDraft);
  saveDrafts();
  emit('draftCreated', newDraft);
  
  emitter.emit(MediaEvents.CreateDraft, newDraft);
};

const onEditDraft = (draft: MediaDraft) => {
  const index = drafts.value.findIndex(d => d.id === draft.id);
  if (index !== -1) {
    drafts.value[index] = { ...draft, updatedAt: new Date() };
    saveDrafts();
    emit('draftUpdated', drafts.value[index]);
  }
};

const onDeleteDraft = (draftId: string) => {
  drafts.value = drafts.value.filter(d => d.id !== draftId);
  saveDrafts();
  emit('draftDeleted', draftId);
  
  emitter.emit(MediaEvents.DeleteDraft, draftId);
};

// Playback Control
const startPlayback = () => {
  if (playQueue.value.length === 0) return;
  
  currentIndex.value = 0;
  playCurrentItem();
};

const playCurrentItem = () => {
  if (!currentMedia.value || currentIndex.value === -1) {
    console.warn('No current media to play');
    return;
  }
  
  // Stop any existing timer
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  
  currentMedia.value = playQueue.value[currentIndex.value];
  isPlaying.value = true;
  
  console.log(`Playing media: ${currentMedia.value.name} (${currentMedia.value.type})`);
  
  // Start duration timer for non-video items
  if (currentMedia.value.type !== 'video') {
    startDurationTimer(5000); // Default 5 seconds for images/audio
  }
};

const stopCurrentItem = () => {
  console.log('Stopping current media');
  
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  
  isPlaying.value = false;
  timeRemaining.value = 0;
};

const startDurationTimer = (duration: number) => {
  timeRemaining.value = duration;
  
  durationTimer = setInterval(() => {
    timeRemaining.value -= 100;
    
    if (timeRemaining.value <= 0) {
      onMediaEnded();
    }
  }, 100);
};

const onMediaEnded = () => {
  console.log('Media ended');
  stopCurrentItem();
  
  // Auto-advance to next item
  if (hasNextItem()) {
    nextItem();
  } else {
    // End of queue
    currentIndex.value = -1;
    currentMedia.value = null;
  }
};

// Navigation helpers
const hasNextItem = (): boolean => {
  return currentIndex.value < playQueue.value.length - 1;
};

const hasPreviousItem = (): boolean => {
  return currentIndex.value > 0;
};

// Navigation
const nextItem = () => {
  if (playQueue.value.length === 0) return;
  
  stopCurrentItem();
  
  if (hasNextItem()) {
    currentIndex.value++;
    playCurrentItem();
  } else {
    // Loop back to beginning
    currentIndex.value = 0;
    playCurrentItem();
  }
};

const previousItem = () => {
  if (playQueue.value.length === 0) return;
  
  stopCurrentItem();
  
  if (hasPreviousItem()) {
    currentIndex.value--;
    playCurrentItem();
  } else {
    // Loop to end
    currentIndex.value = playQueue.value.length - 1;
    playCurrentItem();
  }
};

const togglePlayPause = () => {
  if (playQueue.value.length === 0) return;
  
  if (isPlaying.value) {
    stopCurrentItem();
  } else {
    if (currentIndex.value === -1) {
      startPlayback();
    } else {
      playCurrentItem();
    }
  }
};

const clearQueue = () => {
  stopCurrentItem();
  playQueue.value = [];
  currentIndex.value = -1;
  currentMedia.value = null;
};

// Media Event Handlers
const onVideoLoaded = (videoElement: HTMLVideoElement) => {
  console.log('Video loaded');
  isPlaying.value = true;
  
  videoElement.addEventListener('ended', onVideoEnded);
};

const onVideoEnded = () => {
  console.log('Video ended');
  onMediaEnded();
};

const onImageLoaded = () => {
  console.log('Image loaded');
  if (currentMedia.value && currentMedia.value.type === 'image') {
    startDurationTimer(5000); // 5 seconds for images
  }
};

const onAudioLoaded = (audioElement: HTMLAudioElement) => {
  console.log('Audio loaded');
  isPlaying.value = true;
  
  audioElement.addEventListener('ended', onAudioEnded);
};

const onAudioEnded = () => {
  console.log('Audio ended');
  onMediaEnded();
};

const onMediaError = () => {
  console.error('Media failed to load');
  onMediaEnded();
};

// Event Listeners
emitter.on(MediaEvents.selectedMedia, (media: MediaRecord) => {
  onMediaSelected(media);
});

emitter.on(MediaEvents.CreateDraft, (draft: MediaDraft) => {
  drafts.value.push(draft);
  saveDrafts();
});

emitter.on(MediaEvents.EditDraft, (draft: MediaDraft) => {
  onEditDraft(draft);
});

emitter.on(MediaEvents.DeleteDraft, (draftId: string) => {
  onDeleteDraft(draftId);
});

// Expose methods
defineExpose({
  loadMediaItems,
  loadDrafts,
  playQueue: playQueue.value,
  currentMedia,
  isPlaying,
  viewMode
});

// Lifecycle
onMounted(async () => {
  console.log('MediaPlayer mounted');
  
  // Initialize API
  // api = new MediaApi(apiConfig); // Uncomment when apiConfig is available
  
  // Load initial data
  await loadMediaItems();
  loadDrafts();
});

onUnmounted(() => {
  console.log('MediaPlayer unmounted');
  stopCurrentItem();
});
</script>

<style scoped>
.media-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
  background: #1a1a1a;
  border-radius: 8px;
}

.gallery-view,
.player-view {
  width: 100%;
  height: calc(100% - 60px);
}

.view-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid #333;
}

.view-toggle-btn {
  padding: 8px 16px;
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.view-toggle-btn:hover {
  background: #444;
  border-color: #666;
}

.view-toggle-btn.player-mode {
  background: #2563eb;
  border-color: #3b82f6;
}

.view-toggle-btn.player-mode:hover {
  background: #1d4ed8;
}
</style>
