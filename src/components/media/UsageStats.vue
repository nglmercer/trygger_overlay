<template>
    <div class="text-right text-sm text-white/80 hidden lg:block">
        <p>{{ formatBytes(usedStorage) }} / {{ formatBytes(totalStorage) }}</p>
        <p class="font-bold text-white">{{ usagePercentage }}% used</p>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const totalStorage = 524288000 // 500MB in bytes
const usedStorage = ref(0)

const usagePercentage = computed(() => {
    return ((usedStorage.value / totalStorage) * 100).toFixed(2)
})

function formatBytes(bytes) {
    if (bytes === 0) return '0 KB'
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

// Example: Update used storage (you can modify this value as needed)
usedStorage.value = 1024 * 1024 // 1MB
</script>
