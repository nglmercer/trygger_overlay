<!-- Fixed MediaPlayer.vue -->
<template>
  <div class="widget-container" ref="containerRef">
    <!-- Media Display Component -->
    <MediaDisplay 
      :current-item="currentItem"
      :url-base="urlBase"
      @video-loaded="onVideoLoaded"
      @video-ended="onVideoEnded"
      @image-loaded="onImageLoaded"
      @audio-loaded="onAudioLoaded"
      @audio-ended="onAudioEnded"
      @media-error="onMediaError"
    />

    <!-- Media Info Overlay (always visible) -->
    <MediaInfo 
      v-if="currentItem"
      :current-item="currentItem"
      :current-index="currentIndex"
      :queue-length="queue.length"
    />

    <!-- Development Mode Controls -->
    <MediaControls
      v-if="isDevelopmentMode"
      :queue-length="queue.length"
      :is-playing="isPlaying"
      @previous="previousItem"
      @toggle-play-pause="togglePlayPause"
      @next="nextItem"
      @clear-queue="clearQueue"
    />

    <!-- Development Mode Stats -->
    <MediaStats
      v-if="isDevelopmentMode"
      :queue-length="queue.length"
      :current-item="currentItem"
      :time-remaining="timeRemaining"
    />

    <!-- Development Mode Toggle -->
    <DevModeToggle 
      v-model="isDevelopmentMode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import MediaDisplay from '../widget/MediaDisplay.vue';
import MediaInfo from '../widget/MediaInfo.vue';
import MediaControls from '../widget/MediaControls.vue';
import MediaStats from '../widget/MediaStats.vue';
import DevModeToggle from '../widget/DevModeToggle.vue';
import { initializePositionPool, getRandomPosition, updatePositionPool, type Position } from './positionUtils';

interface MediaItem {
  name: string;
  duration: number;
  maxDuration: boolean;
  active: boolean;
  item: {
    id: string;
    name: string;
    type: 'video' | 'image' | 'audio';
    url: string;
    metadata: {
      size: number;
      type: string;
    }
  };
  type: 'video' | 'image' | 'audio';
  size: number;
  volume: number;
  position: {
    x: number;
    y: number;
  };
  randomPosition: boolean;
  id: string;
}

// Props and Emits
const emit = defineEmits<{
  itemStarted: [item: MediaItem];
  itemEnded: [item: MediaItem];
  queueEmpty: [];
  queueUpdated: [queue: MediaItem[]];
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);

// State
const urlBase = "http://localhost:3000";
const queue = ref<MediaItem[]>([]);
const currentIndex = ref(-1); // Start with -1 to indicate no item is playing
const isPlaying = ref(false);
const timeRemaining = ref(0);
const isDevelopmentMode = ref(false);
const isInitialized = ref(false);
let durationTimer: NodeJS.Timeout | null = null;

// Sample data
const sampleQueue: MediaItem[] = [
  {
    name: "Sample Video",
    duration: 10,
    maxDuration: false,
    active: false,
    item: {
      id: "dcb954e2-a6f2-46f8-b296-4f50bd6cdd00",
      name: "Guayando.mp4",
      type: "video",
      url: "/uploads/videos/dcb954e2-a6f2-46f8-b296-4f50bd6cdd00.mp4",
      metadata: {
        size: 2110113,
        type: "video/mp4"
      }
    },
    type: "video",
    size: 50,
    volume: 50,
    position: { x: 0, y: 0 },
    randomPosition: true,
    id: "e12964c2-3d4d-431d-b077-bb51a6ed1e15"
  },
  {
    name: "Sample Image",
    duration: 5,
    maxDuration: false,
    active: false,
    item: {
      id: "326bd326-3142-4066-8842-d750b9001a28",
      name: "128845117.png",
      type: "image",
      url: "/uploads/images/326bd326-3142-4066-8842-d750b9001a28.png",
      metadata: {
        "size": 270566,
        "type": "image/png"
      }
    },
    type: "image",
    size: 40,
    volume: 0,
    position: { x: 10, y: 10 },
    randomPosition: true,
    id: "img-widget-001"
  }
];

// Computed
const currentItem = computed(() => 
  queue.value.length > 0 && currentIndex.value >= 0 && currentIndex.value < queue.value.length 
    ? queue.value[currentIndex.value] 
    : null
);

// Position management
const assignRandomPosition = (item: MediaItem) => {
  if (item.randomPosition && containerRef.value) {
    const containerRect = containerRef.value.getBoundingClientRect();
    const newPosition = getRandomPosition();
    item.position = newPosition;
  }
};

const initializePositions = async () => {
  if (!containerRef.value) return;
  
  await nextTick();
  const containerRect = containerRef.value.getBoundingClientRect();
  
  if (containerRect.width > 0 && containerRect.height > 0) {
    initializePositionPool();
    
    // Assign positions to existing queue items
    queue.value.forEach(item => {
      if (item.randomPosition) {
        assignRandomPosition(item);
      }
    });
    
    isInitialized.value = true;
    console.log('Position system initialized');
  }
};

// Queue Management Methods
const push = (item: MediaItem) => {
  // Assign random position if needed and system is initialized
  if (isInitialized.value) {
    assignRandomPosition(item);
  }
  
  queue.value.push(item);
  emit('queueUpdated', [...queue.value]);
  
  // Auto-start playback if this is the first item and nothing is playing
  if (queue.value.length === 1 && currentIndex.value === -1) {
    startPlayback();
  }
};

const enqueue = (item: MediaItem) => push(item);
const add = (item: MediaItem) => push(item);

const dequeue = () => {
  if (queue.value.length === 0) return null;
  
  const item = queue.value.shift();
  
  // Adjust current index after removing item
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else if (queue.value.length === 0) {
    currentIndex.value = -1;
    stopCurrentItem();
  } else {
    // Current item was removed, restart playback with new first item
    currentIndex.value = 0;
    if (!isPlaying.value) {
      playCurrentItem();
    }
  }
  
  emit('queueUpdated', [...queue.value]);
  
  if (queue.value.length === 0) {
    emit('queueEmpty');
  }
  
  return item;
};

const clearQueue = () => {
  stopCurrentItem();
  queue.value = [];
  currentIndex.value = -1;
  emit('queueUpdated', []);
  emit('queueEmpty');
};

// Playback Control
const startPlayback = () => {
  if (queue.value.length === 0) return;
  
  currentIndex.value = 0;
  playCurrentItem();
};

const playCurrentItem = () => {
  if (!currentItem.value || currentIndex.value === -1) {
    console.warn('No current item to play');
    return;
  }
  
  const item = currentItem.value;
  
  // Stop any existing timer first
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  
  // Assign random position if needed
  if (isInitialized.value) {
    assignRandomPosition(item);
  }
  
  // Set item as active and playing
  item.active = true;
  isPlaying.value = true;
  
  console.log(`Playing item: ${item.name} (${item.type})`);
  emit('itemStarted', item);
  
  // Start duration timer for non-maxDuration items
  if (!item.maxDuration) {
    startDurationTimer(item.duration * 1000);
  }
};

const stopCurrentItem = () => {
  console.log('Stopping current item');
  
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  
  if (currentItem.value) {
    currentItem.value.active = false;
  }
  
  isPlaying.value = false;
  timeRemaining.value = 0;
};

const startDurationTimer = (duration: number) => {
  timeRemaining.value = duration;
  console.log(`Starting duration timer: ${duration}ms`);
  
  durationTimer = setInterval(() => {
    timeRemaining.value -= 100;
    
    if (timeRemaining.value <= 0) {
      console.log('Duration timer expired');
      onItemEnded();
    }
  }, 100);
};

const onItemEnded = () => {
  console.log('Item ended');
  
  if (currentItem.value) {
    emit('itemEnded', currentItem.value);
    currentItem.value.active = false;
  }
  
  stopCurrentItem();
  
  // Auto-advance to next item
  if (hasNextItem()) {
    nextItem();
  } else {
    // End of queue
    currentIndex.value = -1;
    emit('queueEmpty');
  }
};

// Navigation helpers
const hasNextItem = (): boolean => {
  return currentIndex.value < queue.value.length - 1;
};

const hasPreviousItem = (): boolean => {
  return currentIndex.value > 0;
};

// Navigation
const nextItem = () => {
  if (queue.value.length === 0) {
    console.warn('No items in queue');
    return;
  }
  
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
  if (queue.value.length === 0) {
    console.warn('No items in queue');
    return;
  }
  
  stopCurrentItem();
  
  if (hasPreviousItem()) {
    currentIndex.value--;
    playCurrentItem();
  } else {
    // Loop to end
    currentIndex.value = queue.value.length - 1;
    playCurrentItem();
  }
};

const togglePlayPause = () => {
  if (queue.value.length === 0) {
    console.warn('No items in queue to play/pause');
    return;
  }
  
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

// Media Event Handlers
const onVideoLoaded = (videoElement: HTMLVideoElement) => {
  console.log('Video loaded');
  if (currentItem.value) {
    videoElement.volume = currentItem.value.volume / 100;
    
    if (currentItem.value.maxDuration) {
      videoElement.addEventListener('ended', onVideoEnded);
    }
  }
};

const onVideoEnded = () => {
  console.log('Video ended (maxDuration)');
  if (currentItem.value?.maxDuration) {
    onItemEnded();
  }
};

const onImageLoaded = () => {
  console.log('Image loaded');
};

const onAudioLoaded = (audioElement: HTMLAudioElement) => {
  console.log('Audio loaded');
  if (currentItem.value) {
    audioElement.volume = currentItem.value.volume / 100;
    
    if (currentItem.value.maxDuration) {
      audioElement.addEventListener('ended', onAudioEnded);
    }
  }
};

const onAudioEnded = () => {
  console.log('Audio ended (maxDuration)');
  if (currentItem.value?.maxDuration) {
    onItemEnded();
  }
};

const onMediaError = () => {
  console.error('Media failed to load');
  onItemEnded();
};

// Watch for container size changes
watch(() => containerRef.value, async () => {
  if (containerRef.value && !isInitialized.value) {
    await initializePositions();
  }
});

// Handle window resize
const handleResize = () => {
  if (containerRef.value && isInitialized.value) {
    const containerRect = containerRef.value.getBoundingClientRect();
    if (containerRect.width > 0 && containerRect.height > 0) {
      updatePositionPool();
    }
  }
};

// Expose methods
defineExpose({
  push,
  enqueue,
  add,
  dequeue,
  clearQueue,
  nextItem,
  previousItem,
  startPlayback,
  queue: queue.value,
  currentItem,
  isPlaying
});

// Lifecycle
onMounted(async () => {
  console.log('MediaPlayer mounted');
  
  // Add sample data
  queue.value = [...sampleQueue];
  emit('queueUpdated', [...queue.value]);
  
  // Initialize positions
  await nextTick();
  await initializePositions();
  
  // Start playback if we have items
  if (queue.value.length > 0) {
    startPlayback();
  }
  
  // Listen for window resize
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  console.log('MediaPlayer unmounted');
  stopCurrentItem();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.widget-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
}
</style>