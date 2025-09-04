<template>
  <div class="relative flex items-center w-full max-w-xs">
    <span class="material-symbols-outlined absolute left-3 text-white/50 pointer-events-none">
      search
    </span>
    <input
      v-model="query"
      type="text"
      placeholder="Search"
      class="bg-white/10 w-full text-white placeholder-white/50 h-12 pl-10 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['search'])
const query = ref('')

// Watch for changes in query and emit search event
watch(query, (newValue) => {
  emit('search', newValue)
})

// Export the query ref for use in other components
defineExpose({
  query
})
</script>
