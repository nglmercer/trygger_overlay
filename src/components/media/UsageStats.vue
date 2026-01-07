<template>
    <div class="text-right text-sm text-white/80 hidden lg:block">
        <p>{{ formatBytes(usedStorage) }} / {{ formatBytes(totalStorage) }}</p>
        <p class="font-bold text-white">{{ usagePercentage }}% usado</p>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mediaApi } from '@utils/fetch/fetchapi'

const totalStorage = 524288000 // 500MB in bytes
const usedStorage = ref(0)

const usagePercentage = computed(() => {
    return ((usedStorage.value / totalStorage) * 100).toFixed(2)
})

function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

async function init() {
    try {
        const stats = await mediaApi.getStats()
        console.log("stats", stats)
        
        if (stats && stats.total) {
            usedStorage.value = stats.total.size
        }
    } catch (error) {
        console.error("Error loading storage stats:", error)
    }
}

init()
</script>