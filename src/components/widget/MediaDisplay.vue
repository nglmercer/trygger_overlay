<!-- Enhanced MediaDisplay.vue Component with Audio Management -->
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
      @canplay="handleVideoCanPlay"
      :muted="isVideoMuted"
      preload="auto"
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
      @canplay="handleAudioCanPlay"
      :muted="isAudioMuted"
      controls
      preload="auto"
    ></audio>

    <!-- Audio Permission Overlay -->
    <div 
      v-if="showAudioPrompt" 
      class="audio-permission-overlay"
      @click="requestAudioPermission"
    >
      <div class="audio-prompt-content">
        <div class="audio-icon">🔊</div>
        <p>Click to enable audio playback</p>
        <small>Required for media with sound</small>
      </div>
    </div>

    <!-- Audio Status Indicator -->
    <div 
      v-if="currentItem && !isAudioEnabled && hasAudioContent" 
      class="audio-status-indicator"
      @click="attemptUnmute"
      title="Click to try enabling audio"
    >
      <span class="muted-icon">🔇</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
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
  audioPermissionGranted: [];
  audioPermissionDenied: [];
}>();

// Refs for media elements
const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

// Audio management state
const isAudioEnabled = ref(false);
const showAudioPrompt = ref(false);
const audioContextUnlocked = ref(false);
const isVideoMuted = ref(true);
const isAudioMuted = ref(true);
const userInteracted = ref(false);
const audioTestElement = ref<HTMLAudioElement | null>(null);

// Enhanced sizing configuration
const MEDIA_SIZES = {
  small: { width: 20, height: 15 },
  medium: { width: 30, height: 22.5 },
  large: { width: 40, height: 30 },
  xlarge: { width: 50, height: 37.5 }
};

const ASPECT_RATIOS = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '3:2': 3 / 2,
  '9:16': 9 / 16
};

// Audio detection
const hasAudioContent = computed(() => {
  return props.currentItem && 
         (props.currentItem.type === 'audio' || 
          (props.currentItem.type === 'video' && props.currentItem.volume > 0));
});

// Detect if running in OBS or similar applications
const isInOBSMode = computed(() => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isOBS = userAgent.includes('obs') || 
                userAgent.includes('streamlabs') || 
                userAgent.includes('prism') ||
                userAgent.includes('tiktok') ||
                window.location.hostname === 'localhost' ||
                window.location.protocol === 'file:';
  
  return isOBS || 
         // Check if we're in an iframe (common in streaming apps)
         window !== window.top ||
         // Check for specific streaming software indicators
         'webkitSpeechRecognition' in window;
});

// Audio Context Management
const createAudioContext = () => {
  if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
    const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
    return new AudioContextClass();
  }
  return null;
};

const unlockAudioContext = async () => {
  if (audioContextUnlocked.value) return true;
  
  try {
    const audioContext = createAudioContext();
    if (!audioContext) return false;
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    audioContextUnlocked.value = true;
    audioContext.close();
    return true;
  } catch (error) {
    console.warn('Failed to unlock audio context:', error);
    return false;
  }
};

// Audio Permission Management
const testAudioPlayback = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create a silent audio test
    const testAudio = document.createElement('audio');
    testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeCA==';
    testAudio.volume = 0.01;
    testAudio.muted = false;
    
    const cleanup = () => {
      testAudio.remove();
      testAudio.removeEventListener('play', onPlay);
      testAudio.removeEventListener('pause', onPause);
    };
    
    const onPlay = () => {
      cleanup();
      resolve(true);
    };
    
    const onPause = () => {
      cleanup();
      resolve(false);
    };
    
    testAudio.addEventListener('play', onPlay);
    testAudio.addEventListener('pause', onPause);
    
    // Try to play
    const playPromise = testAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Playback started successfully
        })
        .catch(() => {
          cleanup();
          resolve(false);
        });
    }
    
    // Fallback timeout
    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 1000);
  });
};

const requestAudioPermission = async () => {
  console.log('Requesting audio permission...');
  userInteracted.value = true;
  showAudioPrompt.value = false;
  
  try {
    // First unlock audio context
    await unlockAudioContext();
    
    // Test if we can play audio
    const canPlayAudio = await testAudioPlayback();
    
    if (canPlayAudio || isInOBSMode.value) {
      isAudioEnabled.value = true;
      emit('audioPermissionGranted');
      
      // Apply audio settings to current media
      await applyAudioSettings();
      
      console.log('Audio permission granted');
    } else {
      emit('audioPermissionDenied');
      console.log('Audio permission denied or blocked');
    }
  } catch (error) {
    console.error('Error requesting audio permission:', error);
    emit('audioPermissionDenied');
  }
};

const applyAudioSettings = async () => {
  if (!props.currentItem || !isAudioEnabled.value) return;
  
  const volume = props.currentItem.volume / 100;
  
  if (videoRef.value && props.currentItem.type === 'video') {
    isVideoMuted.value = false;
    await nextTick();
    videoRef.value.volume = volume;
    
    // Try to play if paused
    if (videoRef.value.paused) {
      try {
        await videoRef.value.play();
      } catch (error) {
        console.warn('Could not auto-play video:', error);
      }
    }
  }
  
  if (audioRef.value && props.currentItem.type === 'audio') {
    isAudioMuted.value = false;
    await nextTick();
    audioRef.value.volume = volume;
    
    // Try to play if paused
    if (audioRef.value.paused) {
      try {
        await audioRef.value.play();
      } catch (error) {
        console.warn('Could not auto-play audio:', error);
      }
    }
  }
};

const attemptUnmute = async () => {
  if (!userInteracted.value) {
    await requestAudioPermission();
  } else {
    await applyAudioSettings();
  }
};

// Initialize audio system
const initializeAudio = () => {
  // In OBS mode, assume audio is available
  if (isInOBSMode.value) {
    console.log('Running in OBS/Streaming mode - enabling audio');
    isAudioEnabled.value = true;
    isVideoMuted.value = false;
    isAudioMuted.value = false;
    return;
  }
  
  // For regular browsers, check if we need permission
  if (hasAudioContent.value && !isAudioEnabled.value && !userInteracted.value) {
    showAudioPrompt.value = true;
  }
};

// Size and positioning functions (unchanged)
const getSizeCategory = (size: number): keyof typeof MEDIA_SIZES => {
  if (size <= 25) return 'small';
  if (size <= 50) return 'medium';
  if (size <= 75) return 'large';
  return 'xlarge';
};

const getResponsiveDimensions = (item: TriggerItem) => {
  const sizeCategory = getSizeCategory(item.size);
  const baseDimensions = MEDIA_SIZES[sizeCategory];
  const aspectRatio = ASPECT_RATIOS['16:9'];
  
  let width = baseDimensions.width;
  let height = width / aspectRatio;
  
  if (height > baseDimensions.height) {
    height = baseDimensions.height;
    width = height * aspectRatio;
  }
  
  return { width, height };
};

const getMediaStyle = (item: TriggerItem) => {
  const dimensions = getResponsiveDimensions(item);
  const shouldCenter = (item.position.x === 50 && item.position.y === 50);
  
  return {
    width: `${dimensions.width}vw`,
    left: `${item.position.x}%`,
    top: `${item.position.y}%`,
    minWidth: '150px',
    minHeight: '100px',
    maxWidth: '60vw',
    maxHeight: '60vh',
    transform: shouldCenter ? 'translate(-50%, -50%)' : 'none',
    transformOrigin: shouldCenter ? 'center' : 'top left',
    objectFit: 'contain' as const
  };
};

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

// Enhanced event handlers
const handleVideoLoaded = async () => {
  if (videoRef.value && props.currentItem) {
    const volume = props.currentItem.volume / 100;
    
    if (isAudioEnabled.value || isInOBSMode.value) {
      videoRef.value.volume = volume;
      videoRef.value.muted = false;
      isVideoMuted.value = false;
    } else {
      videoRef.value.volume = volume;
      videoRef.value.muted = true;
      isVideoMuted.value = true;
    }
    
    videoRef.value.addEventListener('loadedmetadata', () => {
      adjustForActualAspectRatio(videoRef.value!);
    });
    
    // Auto-play attempt
    try {
      await videoRef.value.play();
      emit('videoLoaded', videoRef.value);
    } catch (error) {
      console.warn('Video autoplay failed:', error);
      emit('videoLoaded', videoRef.value);
    }
  }
};

const handleVideoCanPlay = async () => {
  if (videoRef.value && (isAudioEnabled.value || isInOBSMode.value)) {
    try {
      await videoRef.value.play();
    } catch (error) {
      console.warn('Video play failed in canplay:', error);
    }
  }
};

const handleAudioLoaded = async () => {
  if (audioRef.value && props.currentItem) {
    const volume = props.currentItem.volume / 100;
    
    if (isAudioEnabled.value || isInOBSMode.value) {
      audioRef.value.volume = volume;
      audioRef.value.muted = false;
      isAudioMuted.value = false;
    } else {
      audioRef.value.volume = volume;
      audioRef.value.muted = true;
      isAudioMuted.value = true;
    }
    
    emit('audioLoaded', audioRef.value);
  }
};

const handleAudioCanPlay = async () => {
  if (audioRef.value && (isAudioEnabled.value || isInOBSMode.value)) {
    try {
      await audioRef.value.play();
    } catch (error) {
      console.warn('Audio play failed in canplay:', error);
    }
  }
};

const handleImageLoaded = () => {
  if (imageRef.value) {
    adjustForActualAspectRatio(imageRef.value);
    emit('imageLoaded');
  }
};

const adjustForActualAspectRatio = (element: HTMLVideoElement | HTMLImageElement) => {
  if (!props.currentItem) return;
  
  let actualAspectRatio: number;
  
  if (element instanceof HTMLVideoElement) {
    actualAspectRatio = element.videoWidth / element.videoHeight;
  } else {
    actualAspectRatio = element.naturalWidth / element.naturalHeight;
  }
  
  if (Math.abs(actualAspectRatio - ASPECT_RATIOS['16:9']) > 0.5) {
    const dimensions = getResponsiveDimensions(props.currentItem);
    
    let newWidth = dimensions.width;
    let newHeight = newWidth / actualAspectRatio;
    
    const maxHeight = 60;
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * actualAspectRatio;
    }
    
    element.style.width = `${newWidth}vw`;
    element.style.height = `${newHeight}vh`;
    element.style.objectFit = 'contain';
  }
};

// Watch for current item changes
watch(() => props.currentItem, async (newItem) => {
  if (newItem) {
    await nextTick();
    initializeAudio();
    
    // Apply audio settings if already enabled
    if (isAudioEnabled.value) {
      await applyAudioSettings();
    }
  } else {
    showAudioPrompt.value = false;
  }
}, { immediate: true });

// Global click listener to enable audio on any interaction
document.addEventListener('click', () => {
  if (!userInteracted.value && !isAudioEnabled.value && hasAudioContent.value) {
    requestAudioPermission();
  }
});
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
  object-fit: cover;
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

/* Audio Permission Overlay */
.audio-permission-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: white;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
}

.audio-permission-overlay:hover {
  background: rgba(0, 0, 0, 0.95);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%) scale(1.05);
}

.audio-prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.audio-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.audio-prompt-content p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.audio-prompt-content small {
  font-size: 12px;
  opacity: 0.7;
}

/* Audio Status Indicator */
.audio-status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  font-size: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-status-indicator:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}

.muted-icon {
  font-size: 18px;
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
  
  .audio-permission-overlay {
    padding: 15px;
  }
  
  .audio-icon {
    font-size: 1.5rem;
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

/* Hover effects */
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