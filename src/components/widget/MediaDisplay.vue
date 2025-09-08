<!-- Enhanced MediaDisplay.vue Component -->
<template>
  <div class="media-wrapper">
    <!-- Video Element -->
    <video
      v-if="currentItem && currentItem.type === 'video'"
      ref="videoRef"
      class="media-element video-element"
      :src="urlBase + currentItem.item.url"
      :style="getMediaStyle(currentItem)"
      @loadedmetadata="handleVideoLoaded"
      @ended="$emit('videoEnded')"
      @error="$emit('mediaError')"
      autoplay
      muted
    ></video>
    
    <!-- Image Element -->
    <img
      v-else-if="currentItem && currentItem.type === 'image'"
      ref="imageRef"
      class="media-element image-element"
      :src="urlBase + currentItem.item.url"
      :style="getMediaStyle(currentItem)"
      @load="handleImageLoaded"
      @error="$emit('mediaError')"
    />
    
    <!-- Audio Element -->
    <audio
      v-else-if="currentItem && currentItem.type === 'audio'"
      ref="audioRef"
      class="audio-element"
      :src="urlBase + currentItem.item.url"
      :style="getAudioStyle(currentItem)"
      @loadedmetadata="handleAudioLoaded"
      @ended="$emit('audioEnded')"
      @error="$emit('mediaError')"
      autoplay
      controls
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type{ TriggerItem } from '@utils/fetch/fetchapi';


const props = defineProps<{
  currentItem: TriggerItem | null;
  urlBase: string;
}>();

const emit = defineEmits<{
  videoLoaded: [element: HTMLVideoElement];
  videoEnded: [];
  imageLoaded: [];
  audioLoaded: [element: HTMLAudioElement];
  audioEnded: [];
  mediaError: [];
}>();

// Refs for media elements
const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

// Enhanced sizing configuration
const MEDIA_SIZES = {
  // Base sizes in viewport units for consistency
  small: { width: 20, height: 15 },    // 20vw x 15vh
  medium: { width: 30, height: 22.5 },  // 30vw x 22.5vh
  large: { width: 40, height: 30 },     // 40vw x 30vh
  xlarge: { width: 50, height: 37.5 }   // 50vw x 37.5vh
};

// Common aspect ratios
const ASPECT_RATIOS = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '3:2': 3 / 2,
  '9:16': 9 / 16  // vertical/portrait
};

// Size mapping based on the size property (0-100)
const getSizeCategory = (size: number): keyof typeof MEDIA_SIZES => {
  if (size <= 25) return 'small';
  if (size <= 50) return 'medium';
  if (size <= 75) return 'large';
  return 'xlarge';
};

// Calculate responsive dimensions
const getResponsiveDimensions = (item: TriggerItem) => {
  const sizeCategory = getSizeCategory(item.size);
  const baseDimensions = MEDIA_SIZES[sizeCategory];
  
  // Use 16:9 as default aspect ratio for videos and images
  const aspectRatio = ASPECT_RATIOS['16:9'];
  
  // Calculate dimensions maintaining aspect ratio
  let width = baseDimensions.width;
  let height = width / aspectRatio;
  
  // Ensure height doesn't exceed the base height
  if (height > baseDimensions.height) {
    height = baseDimensions.height;
    width = height * aspectRatio;
  }
  
  return { width, height };
};

// Enhanced media styling with consistent aspect ratios
const getMediaStyle = (item: TriggerItem) => {
  const dimensions = getResponsiveDimensions(item);
  
  return {
    width: `${dimensions.width}vw`,
    left: `${item.position.x}%`,
    top: `${item.position.y}%`,
    minWidth: '150px',  // Minimum readable size
    minHeight: '100px',
    maxWidth: '60vw',   // Maximum size constraints
    maxHeight: '60vh',
    transform: 'translate(-50%, -50%)', // Center the element on its position
    transformOrigin: 'center'
  };
};

// Audio element styling
const getAudioStyle = (item: TriggerItem) => {
  return {
    left: `${item.position.x}%`,
    top: `${item.position.y}%`,
    width: '300px',
    minWidth: '250px',
    maxWidth: '400px',
    transform: 'translate(-50%, -50%)'
  };
};

// Event handlers with better error handling
const handleVideoLoaded = () => {
  if (videoRef.value) {
    // Set video properties
    videoRef.value.volume = (props.currentItem?.volume || 50) / 100;
    
    // Optional: Adjust dimensions based on actual video aspect ratio
    const video = videoRef.value;
    video.addEventListener('loadedmetadata', () => {
      adjustForActualAspectRatio(video);
    });
    
    emit('videoLoaded', videoRef.value);
  }
};

const handleAudioLoaded = () => {
  if (audioRef.value) {
    audioRef.value.volume = (props.currentItem?.volume || 50) / 100;
    emit('audioLoaded', audioRef.value);
  }
};

const handleImageLoaded = () => {
  if (imageRef.value) {
    // Optional: Adjust dimensions based on actual image aspect ratio
    adjustForActualAspectRatio(imageRef.value);
    emit('imageLoaded');
  }
};

// Function to adjust element size based on actual media aspect ratio
const adjustForActualAspectRatio = (element: HTMLVideoElement | HTMLImageElement) => {
  if (!props.currentItem) return;
  
  let actualAspectRatio: number;
  
  if (element instanceof HTMLVideoElement) {
    actualAspectRatio = element.videoWidth / element.videoHeight;
  } else {
    actualAspectRatio = element.naturalWidth / element.naturalHeight;
  }
  
  // Only adjust if the aspect ratio is significantly different
  if (Math.abs(actualAspectRatio - ASPECT_RATIOS['16:9']) > 0.5) {
    const dimensions = getResponsiveDimensions(props.currentItem);
    
    // Recalculate based on actual aspect ratio
    let newWidth = dimensions.width;
    let newHeight = newWidth / actualAspectRatio;
    
    // Apply viewport height constraints
    const maxHeight = 60; // 60vh max
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * actualAspectRatio;
    }
    
    // Apply the new dimensions
    element.style.width = `${newWidth}vw`;
    element.style.height = `${newHeight}vh`;
    element.style.objectFit = 'contain';
  }
};
</script>

<style scoped>
.media-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.media-element {
  position: absolute;
  border-radius: 8px;
  user-select: none;
  object-fit: cover; /* Changed from contain to cover for better consistency */
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.audio-element {
  position: absolute;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.audio-element::-webkit-media-controls-panel {
  background-color: transparent;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .media-element {
    min-width: 120px;
    min-height: 80px;
  }
}

@media (max-width: 768px) {
  .media-element {
    min-width: 100px;
    min-height: 70px;
    max-width: 80vw;
    max-height: 50vh;
  }
  
  .audio-element {
    width: 250px !important;
    min-width: 200px !important;
  }
}

@media (max-width: 480px) {
  .media-element {
    min-width: 90px;
    min-height: 60px;
    max-width: 90vw;
    max-height: 40vh;
  }
  
  .audio-element {
    width: 200px !important;
    min-width: 180px !important;
  }
}

/* Hover effects for better UX */
.media-element:hover {
  transform: translate(-50%, -50%) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* Loading states */
.media-element[src=""], .media-element:not([src]) {
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  animation: loading 2s linear infinite;
}

@keyframes loading {
  0% { background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
  100% { background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px; }
}

/* Error state */
.media-element[error] {
  background: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-element[error]::after {
  content: '⚠️ Failed to load';
  color: white;
  font-size: 14px;
  text-align: center;
}
</style>