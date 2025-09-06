import BaseApi, { PrefixedApi } from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import apiConfig from './config/apiConfig';

// Tipos para el API de medios
export type MediaType = 'image' | 'audio' | 'video';
export type FormTypes = 'image' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  name?: string;
  metadata?: Record<string, any>;
}

// Base form con propiedades comunes
export interface BaseForm {
  id?: string;
  name: string;
  duration: number;
  maxDuration: boolean;
  active: boolean;
  item: Partial<MediaItem>;
}

// Formularios específicos por tipo (para respuestas del API)
interface ImageForm extends BaseForm {
  size: number;
  position: { x: number; y: number };
  randomPosition: boolean;
  item: MediaItem & { type: 'image' };
}

interface VideoForm extends BaseForm {
  size: number;
  volume: number;
  position: { x: number; y: number };
  randomPosition: boolean;
  item: MediaItem & { type: 'video' };
}

interface AudioForm extends BaseForm {
  volume: number;
  item: MediaItem & { type: 'audio' };
}

// Union type para formularios completos (respuestas del API)
export type TriggerForm = ImageForm | VideoForm | AudioForm;

// Tipos flexibles para creación - propiedades opcionales según el tipo
export interface BaseTriggerInput {
  id?: string;
  name: string;
  duration: number;
  maxDuration: boolean;
  active: boolean;
  item: Partial<MediaItem>;
}

export interface ImageTriggerInput extends BaseTriggerInput {
  item: MediaItem & { type: 'image' };
  // Propiedades específicas de imagen (opcionales para compatibilidad)
  size?: number;
  position?: { x: number; y: number };
  randomPosition?: boolean;
}

export interface VideoTriggerInput extends BaseTriggerInput {
  item: MediaItem & { type: 'video' };
  // Propiedades específicas de video (opcionales para compatibilidad)
  size?: number;
  volume?: number;
  position?: { x: number; y: number };
  randomPosition?: boolean;
}

export interface AudioTriggerInput extends BaseTriggerInput {
  item: MediaItem & { type: 'audio' };
  // Solo volumen para audio (opcional para compatibilidad)
  volume?: number;
}

// Union type para entrada de datos (creación/actualización)
export type TriggerInput = ImageTriggerInput | VideoTriggerInput | AudioTriggerInput | BaseForm;

// Type Guards para formularios completos
const isImageForm = (form: TriggerForm): form is ImageForm => {
  return form.item.type === 'image';
};

const isVideoForm = (form: TriggerForm): form is VideoForm => {
  return form.item.type === 'video';
};

const isAudioForm = (form: TriggerForm): form is AudioForm => {
  return form.item.type === 'audio';
};

// Type Guards para inputs de creación
const isImageInput = (input: TriggerInput): input is ImageTriggerInput => {
  return input.item.type === 'image';
};

const isVideoInput = (input: TriggerInput): input is VideoTriggerInput => {
  return input.item.type === 'video';
};

const isAudioInput = (input: TriggerInput): input is AudioTriggerInput => {
  return input.item.type === 'audio';
};

export const TriggerFormUtils = {
  isImageForm,
  isVideoForm,
  isAudioForm,
  isImageInput,
  isVideoInput,
  isAudioInput,
};

// Función helper para aplicar valores por defecto según el tipo
export const applyDefaultValues = (input: TriggerInput): TriggerForm => {
  if (isImageInput(input)) {
    return {
      ...input,
      size: input.size ?? 100,
      position: input.position ?? { x: 0, y: 0 },
      randomPosition: input.randomPosition ?? false,
      item: input.item as MediaItem & { type: 'image' }
    } as ImageForm;
  }
  
  if (isVideoInput(input)) {
    return {
      ...input,
      size: input.size ?? 100,
      volume: input.volume ?? 50,
      position: input.position ?? { x: 0, y: 0 },
      randomPosition: input.randomPosition ?? false,
      item: input.item as MediaItem & { type: 'video' }
    } as VideoForm;
  }
  
  // Audio form
  return {
    ...input,
    volume: isAudioInput(input) ? input.volume ?? 50 : 50,
    item: input.item as MediaItem & { type: 'audio' }
  } as AudioForm;
};

// API para subir/listar/eliminar medios
export class MediaApi extends PrefixedApi {
  constructor(config = apiConfig) {
    super(config, '/api/media');
  }

  // Subir archivo por tipo: image | audio | video
  async upload(
    type: MediaType,
    file: File | Blob,
    opts: { name?: string; metadata?: any; fileName?: string; extraFields?: Record<string, any> } = {},
    fetchOptions: FetchOptions = {}
  ): Promise<MediaItem> {
    const form = new FormData();
    const filename = opts.fileName || (file instanceof File ? file.name : 'upload');
    
    form.append('file', file, filename);
    
    if (opts.name) form.append('name', String(opts.name));
    
    if (typeof opts.metadata !== 'undefined') {
      try {
        const metaStr = typeof opts.metadata === 'string' ? opts.metadata : JSON.stringify(opts.metadata);
        form.append('metadata', metaStr);
      } catch (e) {
        console.warn('Metadata inválido, no se pudo serializar a JSON:', e);
      }
    }
    
    if (opts.extraFields) {
      for (const [k, v] of Object.entries(opts.extraFields)) {
        form.append(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    }
    
    return this.post<MediaItem>(`/upload/${type}`, form, fetchOptions);
  }

  // Listar todos los medios
  async list(fetchOptions: FetchOptions = {}): Promise<Record<string, MediaItem>> {
    return this.get<Record<string, MediaItem>>('/data', fetchOptions);
  }

  // Eliminar medio por id
  async remove(id: string, fetchOptions: FetchOptions = {}): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/${id}`, fetchOptions);
  }

  async getByType(type: MediaType, fetchOptions: FetchOptions = {}): Promise<MediaItem[]> {
    return this.get<MediaItem[]>(`/data/${type}`, fetchOptions);
  }
}

export class TriggerApi extends PrefixedApi {
  constructor(config = apiConfig) {
    super(config, '/api/trigger');
  }

  async list(fetchOptions: FetchOptions = {}): Promise<TriggerForm[]> {
    return this.get<TriggerForm[]>('/data', fetchOptions);
  }

  async getType(type: FormTypes, fetchOptions: FetchOptions = {}): Promise<TriggerForm[]> {
    return this.get<TriggerForm[]>(`/data/${type}`, fetchOptions);
  }

  // Método de creación que acepta TriggerInput y devuelve TriggerForm
  async create(input: Partial<TriggerInput>, fetchOptions: FetchOptions = {}): Promise<TriggerForm> {
  // El servidor aplicará los valores por defecto, pero opcionalmente puedes hacerlo en el cliente
    return this.post<TriggerForm>('/create', input, fetchOptions);
  }

  // Método de actualización que también acepta TriggerInput
  async update(input: TriggerInput & { id: string }, fetchOptions: FetchOptions = {}): Promise<TriggerForm> {
    return this.put<TriggerForm>(`/${input.id}`, input, fetchOptions);
  }
}

// Exportar todas las instancias y utilidades
export {
  BaseApi,
  apiConfig,
};

// Exportar una instancia lista para usar
export const mediaApi = new MediaApi(apiConfig);
export const triggerApi = new TriggerApi(apiConfig);

// Ejemplos de uso:

// Para crear un trigger de audio (sin necesidad de size, position, etc.)
/*
const audioTrigger: AudioTriggerInput = {
  name: "Mi Audio",
  duration: 5000,
  maxDuration: false,
  active: true,
  item: {
    id: "audio-123",
    type: "audio",
    url: "/path/to/audio.mp3"
  },
  volume: 75 // Opcional
};

triggerApi.create(audioTrigger);
*/

// Para crear un trigger de imagen con todas las propiedades
/*
const imageTrigger: ImageTriggerInput = {
  name: "Mi Imagen",
  duration: 3000,
  maxDuration: true,
  active: true,
  item: {
    id: "image-123",
    type: "image",
    url: "/path/to/image.jpg"
  },
  size: 150,
  position: { x: 100, y: 200 },
  randomPosition: false
};

triggerApi.create(imageTrigger);
*/