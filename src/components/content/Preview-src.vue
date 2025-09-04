<template>
  <div class="group relative h-full w-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300">
    <!-- Image Preview -->
    <img 
      v-if="item.type === 'image' && item.url" 
      :src="getFullImageUrl(item.url)" 
      :alt="item.name || 'Imagen'"
      class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" 
    />
    
    <!-- Video Preview -->
    <div v-else-if="item.type === 'video' && item.url" class="relative h-full w-full">
      <video 
        ref="videoRef"
        :src="getFullImageUrl(item.url)" 
        class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        muted
        preload="metadata"
        @loadedmetadata="onVideoLoaded"
      />
      
      <!-- Video Controls Overlay -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
        <div class="flex items-center space-x-2 opacity-0 transition-all duration-300 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          <button 
            @click="toggleVideoPlay"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-700"
          >
            <MaterialVue :filled="true" class="text-xl">
              {{ !isVideoPlaying ? 'play_arrow' : 'pause' }}
            </MaterialVue>
          </button>
          
          <!-- Volume Control Group -->
          <div class="relative flex items-center group/volume">
            <button 
              @click="toggleVideoMute"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-700"
            >
              <MaterialVue :filled="true" class="text-xl">
                {{ videoVolumeIcon }}
              </MaterialVue>
            </button>
            <!-- Volume Slider -->
        </div>
        <div class="absolute top-full w-24 origin-left transform transition-all duration-200">
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="videoVolume"
            class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 thumb:bg-blue-500"
            @click.stop
          />
        </div>
        </div>
      </div>
      
      <!-- Video Duration Badge -->
      <div v-if="videoDuration" class="absolute bottom-2 right-2 rounded-md bg-black/75 backdrop-blur-sm px-2 py-0.5 text-xs text-white font-medium">
        {{ formatDuration(videoDuration) }}
      </div>
    </div>
    
    <!-- Audio Preview -->
    <div v-else-if="item.type === 'audio' && item.url" class="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20">
      <audio 
        ref="audioRef"
        :src="getFullImageUrl(item.url)" 
        preload="metadata"
        @loadedmetadata="onAudioLoaded"
      />
      
      <!-- Audio Visualization -->
      <div class="flex flex-col items-center space-y-3">
        <!-- Audio Icon with Pulse Effect -->
        <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-xl">
          <div v-if="isAudioPlaying" class="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 animate-ping opacity-30"></div>
          <MaterialVue :filled="true" class="text-2xl text-white relative z-10">
            music_note
          </MaterialVue>
        </div>
        
        <!-- Audio File Name -->
        <p class="text-center text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-48 truncate">
          {{ item.name || 'Audio' }}
        </p>
        
        <!-- Audio Duration -->
        <p v-if="audioDuration" class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {{ formatDuration(audioDuration) }}
        </p>
      </div>
      
      <!-- Audio Controls Overlay -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/10">
        <div class="flex items-center space-x-2 opacity-0 transition-all duration-300 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          <button 
            @click="toggleAudioPlay"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-800 dark:text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-700"
          >
            <MaterialVue :filled="true" class="text-xl">
              {{ !isAudioPlaying ? 'play_arrow' : 'pause' }}
            </MaterialVue>
          </button>
          
          <!-- Volume Control Group -->
          <div class="relative flex items-center group/volume">
            <button 
              @click="toggleAudioMute"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-800 dark:text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-700"
            >
              <MaterialVue :filled="true" class="text-xl">
                {{ audioVolumeIcon }}
              </MaterialVue>
            </button>
             <!-- Volume Slider -->
            </div>
            <div class="absolute top-full w-24 origin-left transform transition-all duration-200">
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="audioVolume"
                class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                @click.stop
              />
            </div>
        </div>
      </div>
    </div>
    
    <!-- Document/File Preview -->
    <div v-else class="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div class="text-center p-4">
        <!-- File Icon with Type-specific Colors -->
        <div class="mx-auto h-14 w-14 flex items-center justify-center rounded-2xl mb-3 transition-colors duration-300"
             :class="getFileIconBg(item.type)">
          <MaterialVue :filled="true" class="text-2xl" :class="getFileIconColor(item.type)">
            {{ getFileIcon(item.type) }}
          </MaterialVue>
        </div>
        
        <!-- File Name -->
        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 max-w-48 truncate">
          {{ item.name || 'Archivo' }}
        </p>
        
        <!-- File Type Badge -->
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {{ item.type || 'file' }}
        </span>
      </div>
    </div>

    <!-- Hover Overlay for Better UX -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
  </div>
</template>

<script>
import MaterialVue from '@components/static/MaterialVue.vue'

export default {
  name: 'MediaPreview',
  components: {
    MaterialVue
  },
  props: {
    item: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value === 'object' && value.type && value.url;
      }
    },
    getFullImageUrl: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isVideoPlaying: false,
      isVideoMuted: true, // Video starts muted via HTML attribute
      isAudioPlaying: false,
      isAudioMuted: false,
      videoDuration: null,
      audioDuration: null,
      videoVolume: 100, // Range: 0-100
      audioVolume: 100  // Range: 0-100
    }
  },
  computed: {
    videoVolumeIcon() {
      if (this.isVideoMuted || this.videoVolume == 0) return 'volume_off';
      if (this.videoVolume < 50) return 'volume_down';
      return 'volume_up';
    },
    audioVolumeIcon() {
      if (this.isAudioMuted || this.audioVolume == 0) return 'volume_off';
      if (this.audioVolume < 50) return 'volume_down';
      return 'volume_up';
    }
  },
  watch: {
    videoVolume(newVolume) {
      const video = this.$refs.videoRef;
      if (!video) return;

      const volumeValue = Number(newVolume) / 100;
      video.volume = volumeValue;
      
      // If user drags slider from 0, unmute. If they drag to 0, mute.
      if (volumeValue > 0 && video.muted) {
        video.muted = false;
        this.isVideoMuted = false;
      } else if (volumeValue === 0 && !video.muted) {
        video.muted = true;
        this.isVideoMuted = true;
      }
    },
    audioVolume(newVolume) {
      const audio = this.$refs.audioRef;
      if (!audio) return;
      
      const volumeValue = Number(newVolume) / 100;
      audio.volume = volumeValue;

      if (volumeValue > 0 && audio.muted) {
        audio.muted = false;
        this.isAudioMuted = false;
      } else if (volumeValue === 0 && !audio.muted) {
        audio.muted = true;
        this.isAudioMuted = true;
      }
    }
  },
  methods: {
    // Video Methods
    toggleVideoPlay() {
      const video = this.$refs.videoRef;
      if (video) {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    },
    
    toggleVideoMute() {
      const video = this.$refs.videoRef;
      if (video) {
        video.muted = !video.muted;
        this.isVideoMuted = video.muted;
      }
    },
    
    onVideoLoaded() {
      const video = this.$refs.videoRef;
      if (video && video.duration && isFinite(video.duration)) {
        this.videoDuration = video.duration;
      }
    },
    
    // Audio Methods
    toggleAudioPlay() {
      const audio = this.$refs.audioRef;
      if (audio) {
        if (audio.paused) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
    },
    
    toggleAudioMute() {
      const audio = this.$refs.audioRef;
      if (audio) {
        audio.muted = !audio.muted;
        this.isAudioMuted = audio.muted;
      }
    },
    
    onAudioLoaded() {
      const audio = this.$refs.audioRef;
      if (audio && audio.duration && isFinite(audio.duration)) {
        this.audioDuration = audio.duration;
      }
    },
    
    // File Type Utilities
    getFileIcon(type) {
      const iconMap = {
        'pdf': 'picture_as_pdf', 'doc': 'description', 'docx': 'description',
        'txt': 'description', 'xls': 'table_chart', 'xlsx': 'table_chart',
        'ppt': 'slideshow', 'pptx': 'slideshow', 'zip': 'folder_zip',
        'rar': 'folder_zip', 'default': 'insert_drive_file'
      };
      return iconMap[type?.toLowerCase()] || iconMap.default;
    },
    
    getFileIconBg(type) {
      const bgMap = {
        'pdf': 'bg-red-100 dark:bg-red-900/30', 'doc': 'bg-blue-100 dark:bg-blue-900/30',
        'docx': 'bg-blue-100 dark:bg-blue-900/30', 'txt': 'bg-gray-100 dark:bg-gray-700',
        'xls': 'bg-green-100 dark:bg-green-900/30', 'xlsx': 'bg-green-100 dark:bg-green-900/30',
        'ppt': 'bg-orange-100 dark:bg-orange-900/30', 'pptx': 'bg-orange-100 dark:bg-orange-900/30',
        'zip': 'bg-purple-100 dark:bg-purple-900/30', 'rar': 'bg-purple-100 dark:bg-purple-900/30',
        'default': 'bg-gray-100 dark:bg-gray-700'
      };
      return bgMap[type?.toLowerCase()] || bgMap.default;
    },
    
    getFileIconColor(type) {
      const colorMap = {
        'pdf': 'text-red-600 dark:text-red-400', 'doc': 'text-blue-600 dark:text-blue-400',
        'docx': 'text-blue-600 dark:text-blue-400', 'txt': 'text-gray-600 dark:text-gray-400',
        'xls': 'text-green-600 dark:text-green-400', 'xlsx': 'text-green-600 dark:text-green-400',
        'ppt': 'text-orange-600 dark:text-orange-400', 'pptx': 'text-orange-600 dark:text-orange-400',
        'zip': 'text-purple-600 dark:text-purple-400', 'rar': 'text-purple-600 dark:text-purple-400',
        'default': 'text-gray-600 dark:text-gray-400'
      };
      return colorMap[type?.toLowerCase()] || colorMap.default;
    },
    
    // Utility Methods
    formatDuration(seconds) {
      if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  },
  
  mounted() {
    if (this.$refs.videoRef) {
      const video = this.$refs.videoRef;
      video.addEventListener('ended', () => { this.isVideoPlaying = false; });
      video.addEventListener('pause', () => { this.isVideoPlaying = false; });
      video.addEventListener('play', () => { this.isVideoPlaying = true; });
    }
    
    if (this.$refs.audioRef) {
      const audio = this.$refs.audioRef;
      // Set initial volume
      audio.volume = this.audioVolume / 100;
      audio.addEventListener('ended', () => { this.isAudioPlaying = false; });
      audio.addEventListener('pause', () => { this.isAudioPlaying = false; });
      audio.addEventListener('play', () => { this.isAudioPlaying = true; });
    }
  },
  
  beforeUnmount() {
    if (this.$refs.videoRef) this.$refs.videoRef.pause();
    if (this.$refs.audioRef) this.$refs.audioRef.pause();
  }
}
</script>

<style scoped>
/* Custom styling for range input thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #3b82f6; /* blue-500 */
  border-radius: 50%;
  cursor: pointer;
  margin-top: -3.5px; /* Vertically center thumb */
}

input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.dark input[type="range"]::-webkit-slider-thumb {
  background: #60a5fa; /* blue-400 */
}

.dark input[type="range"]::-moz-range-thumb {
  background: #60a5fa;
}

/* Custom animations */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: scale(0.95);
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.02);
}

/* Better backdrop blur support */
@supports (backdrop-filter: blur(10px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
}

/* Dark mode transitions */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
</style>