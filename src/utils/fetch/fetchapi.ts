import BaseApi, { PrefixedApi } from './commons/BaseApi';
import type { FetchOptions } from './commons/httpservice';
import apiConfig from './config/apiConfig';
export {apiConfig}
export type MediaType = 'image' | 'audio' | 'video' | 'subtitle';

export interface MediaRecord {
  id: string;
  type: MediaType;
  url: string;
  name: string;
  size: number;
  sizeFormatted: string;
  metadata: Record<string, unknown>;
}

export interface SyncResponse {
  message: string;
  added: number;
  details: Record<MediaType, number>;
}

export interface StatsResponse {
  total: {
    count: number;
    size: number;
    sizeFormatted: string;
  };
  byType: Record<MediaType, {
    count: number;
    size: number;
    sizeFormatted: string;
  }>;
}

export interface SizeResponse {
  id: string;
  size: number;
  sizeFormatted: string;
}

class MediaApi extends PrefixedApi {
  constructor(config: typeof apiConfig) {
    super(config, '/api/media');
  }

  async uploadMedia(type: MediaType, file: File, metadata?: Record<string, unknown>): Promise<MediaRecord> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return this.post<MediaRecord>(`/upload/${type}`, formData);
  }

  async deleteMedia(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/${id}`);
  }

  async syncMedia(): Promise<SyncResponse> {
    return this.post<SyncResponse>('/sync');
  }

  async getMediaByType(type: MediaType): Promise<MediaRecord[]> {
    return this.get<MediaRecord[]>(`/data/${type}`);
  }

  // Alias for getMediaByType to match the interface expected by components
  async getByType(type: MediaType): Promise<MediaRecord[]> {
    return this.getMediaByType(type);
  }

  async getStats(): Promise<StatsResponse> {
    return this.get<StatsResponse>('/stats');
  }

  async getMediaSize(id: string): Promise<SizeResponse> {
    return this.get<SizeResponse>(`/${id}/size`);
  }

  // This matches the route in index.ts: app.get('/api/media/data', ...)
  // Since PrefixedApi adds /api/media, we need to be careful.
  // The route in index.ts is /api/media/data.
  // If we use this.get('/data'), it becomes /api/media/data.
  async getAllMedia(): Promise<Record<string, MediaRecord>> {
    return this.get<Record<string, MediaRecord>>('/data');
  }
}

// Create and export a mediaApi instance
export const mediaApi = new MediaApi(apiConfig);

// Export the default class as well
export default MediaApi;

// Additional types and interfaces for trigger functionality
export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface TriggerForm {
  name: string;
  item: MediaItem;
  size?: number;
  volume?: number;
  duration: number;
  maxDuration: boolean;
  position?: { x: number; y: number };
  randomPosition: boolean;
  active: boolean;
}

// Trigger API class
class TriggerApi extends PrefixedApi {
  constructor(config: typeof apiConfig) {
    super(config, '/api/triggers');
  }

  async list(): Promise<TriggerForm[]> {
    return this.get<TriggerForm[]>('/');
  }

  async create(trigger: Omit<TriggerForm, 'id'>): Promise<TriggerForm> {
    return this.post<TriggerForm>('/', trigger);
  }

  async update(id: string, trigger: Partial<TriggerForm>): Promise<TriggerForm> {
    return this.put<TriggerForm>(`/${id}`, trigger);
  }

  async deleteTrigger(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/${id}`);
  }
}

// Create and export triggerApi instance
export const triggerApi = new TriggerApi(apiConfig);

// TriggerFormUtils utility class
export class TriggerFormUtils {
  static createVideoForm(name: string, item: MediaItem): TriggerForm {
    return {
      name,
      item,
      size: 50,
      volume: 0.8,
      duration: 5,
      maxDuration: false,
      position: { x: 0, y: 0 },
      randomPosition: false,
      active: true,
    };
  }

  static createImageForm(name: string, item: MediaItem): TriggerForm {
    return {
      name,
      item,
      size: 100,
      duration: 0,
      maxDuration: true,
      position: { x: 50, y: 50 },
      randomPosition: true,
      active: true,
    };
  }

  static createAudioForm(name: string, item: MediaItem): TriggerForm {
    return {
      name,
      item,
      volume: 0.5,
      duration: 30,
      maxDuration: false,
      randomPosition: false,
      active: true,
    };
  }

  static validateForm(form: TriggerForm): string[] {
    const errors: string[] = [];
    
    if (!form.name.trim()) {
      errors.push('Name is required');
    }
    
    if (!form.item) {
      errors.push('Media item is required');
    }
    
    if (form.item.type === 'video' || form.item.type === 'audio') {
      if (form.volume === undefined || form.volume < 0 || form.volume > 1) {
        errors.push('Volume must be between 0 and 1');
      }
    }
    
    if (form.item.type === 'image' || form.item.type === 'video') {
      if (!form.position || form.randomPosition) {
        // Position is optional if randomPosition is true
      } else {
        if (typeof form.position.x !== 'number' || typeof form.position.y !== 'number') {
          errors.push('Position must have valid x and y coordinates');
        }
      }
    }
    
    return errors;
  }
}
