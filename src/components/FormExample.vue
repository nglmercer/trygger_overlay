<template>
    <dlg-cont class="Trigger_modal">
        <div class="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
            <!-- El título ahora es dinámico -->
            <h2 class="text-xl font-semibold mb-6 text-center">New {{ form.type }} Trigger</h2>
            
            <form @submit.prevent="handleSubmit" class="space-y-6">
                
                <!-- File Selection (para image y video) -->
                <div class="text-center" v-if="(form.type === 'image' || form.type === 'video' || form.type === 'audio')">
                    <button 
                        type="button" 
                        @click="selectFile"
                        class="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                    >
                        <MaterialVue size="sm">{{ form.type === 'image' ? 'image' : form.type === 'video' ? 'videocam' : 'volume_up' }}</MaterialVue>
                        SELECT {{ form.type.toUpperCase() }}
                    </button> 
                    <div class="aspect-video" v-if="formItem.url" v-show="formItem.url">
                        <PreviewSrc v-if="(formItem.type === 'image' || formItem.type === 'audio' || formItem.type === 'video') && formItem.url" :item="formItem" :getFullImageUrl="getFullImageUrl" />
                    </div>
                </div>

                <!-- Name Input (común a todos) -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-300">Name</label>
                    <input 
                        type="text" 
                        v-model="form.name"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter name"
                    />
                </div>

                <!-- Size Slider (solo para image y video) -->
                <div v-if="'size' in form" class="space-y-2">
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
                            v-model="form.size"
                            class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span class="text-sm bg-gray-700 px-2 py-1 rounded min-w-[3rem] text-center">
                            {{ form.size }}%
                        </span>
                    </div>
                </div>

                <!-- Volume Slider (solo para video y audio) -->
                <div v-if="'volume' in form" class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium text-gray-300">Volume (%)</label>
                        <div class="flex items-center gap-2">
                            <MaterialVue size="sm" class="text-gray-400">volume_up</MaterialVue>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            v-model="form.volume"
                            class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span class="text-sm bg-gray-700 px-2 py-1 rounded min-w-[3rem] text-center">
                            {{ form.volume }}%
                        </span>
                    </div>
                </div>

                <!-- Duration Settings (común a todos) -->
                <div class="space-y-3">
                    <label class="text-sm font-medium text-gray-300">Minimum duration (seconds)</label>
                    <div class="flex items-center gap-3">
                        <input 
                            type="number" 
                            min="1"
                            v-model="form.duration"
                            :disabled="form.maxDuration"
                            class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed w-20"
                        />
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                v-model="form.maxDuration"
                                class="sr-only"
                            />
                            <div class="relative">
                                <div :class="[
                                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200',
                                    form.maxDuration 
                                        ? 'bg-indigo-600 border-indigo-600' 
                                        : 'border-gray-500'
                                ]">
                                    <MaterialVue 
                                        v-if="form.maxDuration" 
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

                <!-- Position Settings (solo para image y video) -->
                <div v-if="'position' in form" class="space-y-3">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">X position</label>
                            <input 
                                type="number" 
                                v-model="form.position.x"
                                :disabled="form.randomPosition"
                                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Y position</label>
                            <input 
                                type="number" 
                                v-model="form.position.y"
                                :disabled="form.randomPosition"
                                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            v-model="form.randomPosition"
                            class="sr-only"
                        />
                        <div class="relative">
                            <div :class="[
                                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200',
                                form.randomPosition 
                                    ? 'bg-indigo-600 border-indigo-600' 
                                    : 'border-gray-500'
                            ]">
                                <MaterialVue 
                                    v-if="form.randomPosition" 
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
    </dlg-cont>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import MaterialVue from '@components/static/MaterialVue.vue';
import { DlgCont } from '@litcomponents/modal'
import { emitter } from "@utils/Emitter";
import { MediaEvents, TriggerEvents } from "src/config/events";
import type { MediaItem, MediaType } from "@utils/fetch/fetchapi";
import { triggerApi, applyDefaultValues } from "@utils/fetch/fetchapi";
import PreviewSrc from "./content/Preview-src.vue";
import { getFullImageUrl } from "@utils/Url";

// --- TYPE DEFINITIONS ---
type FormTypes = 'image' | 'video' | 'audio';

interface BaseForm {
    name: string;
    type: FormTypes;
    duration: number;
    maxDuration: boolean;
    active: boolean;
    item: Partial<MediaItem>;
}

interface ImageForm extends BaseForm {
    type: 'image';
    size: number;
    position: { x: number; y: number };
    randomPosition: boolean;
}

interface VideoForm extends BaseForm {
    type: 'video';
    size: number;
    volume: number;
    position: { x: number; y: number };
    randomPosition: boolean;
}

interface AudioForm extends BaseForm {
    type: 'audio';
    volume: number;
}

// Union type for the form state
type TriggerForm = ImageForm | VideoForm | AudioForm;

// --- DEFAULT FORM STATES ---
const defaultImageData: ImageForm = {
    name: "",
    item: {} as Partial<MediaItem>,
    type: "image",
    size: 50,
    duration: 5,
    maxDuration: false,
    position: { x: 0, y: 0 },
    randomPosition: false,
    active: true,
};

const defaultVideoData: VideoForm = {
    name: "",
    type: "video",
    item: {} as Partial<MediaItem>,
    size: 50,
    volume: 50,
    duration: 5,
    maxDuration: false,
    position: { x: 0, y: 0 },
    randomPosition: false,
    active: true,
};

const defaultAudioData: AudioForm = {
    name: "",
    item: {} as Partial<MediaItem>,
    type: "audio",
    volume: 50,
    duration: 5,
    maxDuration: false,
    active: true,
};

// --- REACTIVE STATE ---
const formType = ref<FormTypes>('image');

// NUEVO: Estado de datos preservados
const preservedData = ref({
    // Datos comunes
    name: "",
    duration: 5,
    maxDuration: false,
    active: true,
    item: {} as Partial<MediaItem>,
    
    // Datos específicos por tipo
    size: 50,
    volume: 50,
    position: { x: 0, y: 0 },
    randomPosition: false
});

// The main form state, its type will be dynamically handled
const form = ref<TriggerForm>(defaultImageData);

const formItem = computed(() => {
    return { ...form.value.item, type: formType.value }
});

// --- NUEVAS FUNCIONES DE PRESERVACIÓN ---

// Función para guardar los datos actuales antes de cambiar de tipo
const preserveCurrentData = () => {
    // Siempre preservar datos comunes
    preservedData.value.name = form.value.name;
    preservedData.value.duration = form.value.duration;
    preservedData.value.maxDuration = form.value.maxDuration;
    preservedData.value.active = form.value.active;
    preservedData.value.item = { ...form.value.item };
    
    // Preservar datos específicos si existen
    if ('size' in form.value) {
        preservedData.value.size = form.value.size;
    }
    if ('volume' in form.value) {
        preservedData.value.volume = form.value.volume;
    }
    if ('position' in form.value) {
        preservedData.value.position = { ...form.value.position };
        preservedData.value.randomPosition = form.value.randomPosition;
    }
};

// Función mejorada para crear el formulario por tipo preservando datos
const createFormByType = (type: FormTypes): TriggerForm => {
    const baseData = {
        name: preservedData.value.name || "",
        duration: preservedData.value.duration || 5,
        maxDuration: preservedData.value.maxDuration || false,
        active: preservedData.value.active !== undefined ? preservedData.value.active : true,
        item: preservedData.value.item || {} as Partial<MediaItem>,
    };

    switch (type) {
        case 'image':
            return {
                ...baseData,
                type: 'image',
                size: preservedData.value.size || 50,
                position: preservedData.value.position || { x: 0, y: 0 },
                randomPosition: preservedData.value.randomPosition || false,
            } as ImageForm;

        case 'video':
            return {
                ...baseData,
                type: 'video',
                size: preservedData.value.size || 50,
                volume: preservedData.value.volume || 50,
                position: preservedData.value.position || { x: 0, y: 0 },
                randomPosition: preservedData.value.randomPosition || false,
            } as VideoForm;

        case 'audio':
            return {
                ...baseData,
                type: 'audio',
                volume: preservedData.value.volume || 50,
            } as AudioForm;

        default:
            // For unknown types, default to audio form to ensure required properties
            return {
                ...baseData,
                type: type as 'audio', // Cast to audio as fallback
                volume: preservedData.value.volume || 50
            } as AudioForm;
    }
};

// Function to reset the form state based on the selected type
const setFormByType = (type: FormTypes) => {
    const TriggerModal = document.querySelector('.Trigger_modal') as DlgCont;
    TriggerModal?.show();
    
    // CAMBIO PRINCIPAL: Preservar datos actuales antes de cambiar
    preserveCurrentData();
    
    // Crear nuevo formulario con datos preservados
    form.value = createFormByType(type);
};

// --- EVENT HANDLERS ---
emitter.on(TriggerEvents.FormType, (type: FormTypes) => {
    formType.value = type;
    setFormByType(type);
});

// temporal emit, to test the form type
emitter.emit(TriggerEvents.FormType, 'video')

emitter.on(MediaEvents.selectedMedia, (data: { item: MediaItem, type: MediaType }) => {
    console.log("selectedMedia", data);
    if (!data || !data.type) return;
    if (data.type !== formType.value) return;
    
    form.value.item = data.item;
    // También actualizar los datos preservados
    preservedData.value.item = data.item;
    
    console.log("form.value.item", form.value.item, formItem.value);
    const modal = document.querySelector('.upload_modal') as DlgCont;
    modal.hide();
})

// Watch for changes in the formType dropdown and reset the form
watch(formType, (newType) => {
    setFormByType(newType);
});

// NUEVO: Watch para mantener sincronizados los datos preservados
watch(form, (newForm) => {
    preserveCurrentData();
}, { deep: true });

const selectFile = () => {
    console.log(`Select ${form.value.type} file clicked`);
    emitter.emit('TriggerForm:selectFile', form.value.type)
    const modal = document.querySelector('.upload_modal') as DlgCont;
    modal.show();
}

const handleSubmit = () => {
    console.log("Form submitted:", form.value);
    triggerApi.create(applyDefaultValues(form.value)).then((res) => {
        console.log("res", res);
    })
}

const handleCancel = () => {
    // CAMBIO: Solo resetear a valores por defecto, no preservar datos anteriores
    preservedData.value = {
        name: "",
        duration: 5,
        maxDuration: false,
        active: true,
        item: {} as Partial<MediaItem>,
        size: 50,
        volume: 50,
        position: { x: 0, y: 0 },
        randomPosition: false
    };
    
    setFormByType(formType.value);
    console.log("Form cancelled and reset to defaults");
}

// NUEVA: Función para limpiar completamente el formulario
const resetForm = () => {
    preservedData.value = {
        name: "",
        duration: 5,
        maxDuration: false,
        active: true,
        item: {} as Partial<MediaItem>,
        size: 50,
        volume: 50,
        position: { x: 0, y: 0 },
        randomPosition: false
    };
    form.value = createFormByType(formType.value);
};

// Exponer funciones si es necesario desde el componente padre
defineExpose({
    resetForm,
    preservedData: preservedData
});

</script>

<style>
/* Custom slider styling (sin cambios) */
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