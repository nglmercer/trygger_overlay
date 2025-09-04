<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 class="text-xl font-semibold mb-6 text-center">New Image Trigger</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Image Selection -->
        <div class="text-center">
          <button 
            type="button" 
            @click="selectImage"
            class="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <MaterialVue size="sm">image</MaterialVue>
            SELECT IMAGE
          </button>
        </div>
         <!-- Name Input -->
         <div class="space-y-2 space-x-2">
          <label class="text-sm font-medium text-gray-300">Name</label>
          <input 
            type="text" 
            v-model="Imageform.name"
            class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter name"
          />
        </div>
        <!-- Size Slider -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-300">Size (%)</label>
            <div class="flex items-center gap-2">
              <MaterialVue size="sm" class="text-gray-400">photo_size_select_small</MaterialVue>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <input 
              type="range" 
              min="1" 
              max="100" 
              v-model="Imageform.size"
              class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span class="text-sm bg-gray-700 px-2 py-1 rounded min-w-[3rem] text-center">
              {{ Imageform.size }}%
            </span>
          </div>
        </div>

        <!-- Duration Settings -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-300">Minimum duration</label>
          <div class="flex items-center gap-3">
            <input 
              type="number" 
              min="1"
              v-model="Imageform.duration"
              :disabled="Imageform.maxDuration"
              class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed w-20"
            />
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="Imageform.maxDuration"
                class="sr-only"
              />
              <div class="relative">
                <div :class="[
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200',
                  Imageform.maxDuration 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'border-gray-500'
                ]">
                  <MaterialVue 
                    v-if="Imageform.maxDuration" 
                    size="xs" 
                    class="text-white"
                  >
                    check
                  </MaterialVue>
                </div>
              </div>
              <span class="text-sm text-gray-300">Indefinite duration</span>
            </label>
          </div>
        </div>

        <!-- Position Settings -->
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">X position</label>
              <input 
                type="number" 
                v-model="Imageform.position.x"
                :disabled="Imageform.randomPosition"
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Y position</label>
              <input 
                type="number" 
                v-model="Imageform.position.y"
                :disabled="Imageform.randomPosition"
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </div>
          </div>
          
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="Imageform.randomPosition"
              class="sr-only"
            />
            <div class="relative">
              <div :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200',
                Imageform.randomPosition 
                  ? 'bg-indigo-600 border-indigo-600' 
                  : 'border-gray-500'
              ]">
                <MaterialVue 
                  v-if="Imageform.randomPosition" 
                  size="xs" 
                  class="text-white"
                >
                  check
                </MaterialVue>
              </div>
            </div>
            <span class="text-sm text-gray-300">Random position</span>
          </label>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button 
            type="button"
            @click="handleCancel"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-md font-medium transition-colors duration-200"
          >
            CANCEL
          </button>
          <button 
            type="submit"
            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition-colors duration-200"
          >
            SAVE
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import MaterialVue from '@components/static/MaterialVue.vue'

interface ImageForm {
  name: string,
  type: string,
  size: number,
  duration: number,
  maxDuration: boolean,
  position: {
    x: number,
    y: number,
  },
  randomPosition: boolean,
}

const Imageform = ref<ImageForm>({
  name: "hola",
  type: "image",
  size: 50, // Default to 50%
  duration: 5,
  maxDuration: false,
  position: {
    x: 0,
    y: 0,
  },
  randomPosition: false,
})

const selectImage = () => {
  // TODO: Implement image selection logic
  console.log("Select image clicked")
}

const handleSubmit = () => {
  // TODO: Implement form submission logic
  console.log("Form submitted:", Imageform.value)
}

const handleCancel = () => {
  // TODO: Implement cancel logic
  console.log("Form cancelled")
}
</script>

<style>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: 2px solid #1f2937;
  box-shadow: 0 0 0 1px #374151;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: 2px solid #1f2937;
  box-shadow: 0 0 0 1px #374151;
}

.slider::-webkit-slider-track {
  background: #374151;
  height: 8px;
  border-radius: 4px;
}

.slider::-moz-range-track {
  background: #374151;
  height: 8px;
  border-radius: 4px;
}
</style>